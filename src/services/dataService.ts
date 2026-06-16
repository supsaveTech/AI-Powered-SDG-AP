import { SurveyResponse } from '../types';
import { mockSurveyData } from '../data/mockData';
import { parseGoogleSheetsData } from './googleSheetsParser';
import { parseCsvData } from './csvParser';

export type SyncStatus = 
  | 'live' 
  | 'csv' 
  | 'uploaded-csv'
  | 'cached-csv'
  | 'mock' 
  | 'offline'
  | 'error-auth'
  | 'error-permission'
  | 'error-not-found'
  | 'error-invalid-range'
  | 'error-parser'
  | 'error-network'
  | 'error-env';

export interface DataDiagnostics {
  source: string;
  syncStatus: SyncStatus;
  httpStatus: number | null;
  requestUrl: string | null;
  spreadsheetId: string | null;
  requestedRange: string | null;
  rowsReturned: number;
  lastUpdated: Date | null;
  errorMessage: string | null;
  rawResponsePreview: string | null;
  envApiKey: boolean;
  envSheetId: boolean;
  envCsvUrl: boolean;
}

export interface DataStatus {
  totalResponses: number;
  isConnected: boolean;
  syncTime: Date | null;
  syncStatus: SyncStatus;
}

export class DataService {
  private static instance: DataService;
  private data: SurveyResponse[] = [];
  
  // Diagnostics
  private syncStatus: SyncStatus = 'offline';
  private source: string = 'None';
  private httpStatus: number | null = null;
  private requestUrl: string | null = null;
  private spreadsheetId: string | null = null;
  private requestedRange: string | null = null;
  private rowsReturned: number = 0;
  private lastUpdated: Date | null = null;
  private errorMessage: string | null = null;
  private rawResponsePreview: string | null = null;

  private constructor() {
    this.tryRestoreCachedCsv();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private tryRestoreCachedCsv() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('uploaded_csv_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.data = parsed;
            this.syncStatus = 'cached-csv';
            this.source = 'Cached CSV';
            this.rowsReturned = parsed.length;
            
            const timestamp = localStorage.getItem('uploaded_csv_timestamp');
            this.lastUpdated = timestamp ? new Date(timestamp) : new Date();
          }
        }
      } catch (e) {
        console.error('Failed to restore cached CSV', e);
      }
    }
  }

  public async fetchData(forceRefresh: boolean = false): Promise<SurveyResponse[]> {
    if (this.data.length > 0 && !forceRefresh && this.syncStatus !== 'offline' && this.syncStatus !== 'error-env' && !this.syncStatus.startsWith('error-')) {
      return this.data;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID;
    const csvUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL;

    // 1. Try Google Sheets API
    if (apiKey && sheetId) {
      const success = await this.fetchFromGoogleSheets(apiKey, sheetId);
      if (success) return this.data;
      // DO NOT silently fall back. Surface the error.
      return this.data;
    }

    // 2. Try CSV URL
    if (csvUrl) {
      const success = await this.fetchFromCsvUrl(csvUrl);
      if (success) return this.data;
      return this.data;
    }

    // 3. Cached / Uploaded CSV fallback
    if (this.data.length > 0 && (this.syncStatus === 'uploaded-csv' || this.syncStatus === 'cached-csv')) {
      return this.data;
    }

    // 4. Missing Env error if absolutely nothing is configured
    if (!apiKey && !sheetId && !csvUrl) {
      this.syncStatus = 'error-env';
      this.errorMessage = 'Environment variables NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY and SPREADSHEET_ID are missing.';
      this.source = 'None';
    }
    
    // 5. Mock Data as absolute last resort
    if (this.syncStatus === 'error-env') {
      console.warn("No real data sources configured. Falling back to mock data as last resort.");
      this.data = mockSurveyData;
      this.syncStatus = 'mock';
      this.source = 'Mock Data';
      this.lastUpdated = new Date();
      this.rowsReturned = this.data.length;
    }
    
    return this.data;
  }

  private async fetchFromGoogleSheets(apiKey: string, sheetId: string): Promise<boolean> {
    this.spreadsheetId = sheetId;
    this.requestedRange = 'Form Responses 1!A:Z';
    this.requestUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${this.requestedRange}?key=***HIDDEN***`;
    this.source = 'Google Sheets API';
    
    console.info("----------------------------------------");
    console.info("Google Sheets Request");
    console.info(`URL: ${this.requestUrl}`);
    console.info(`Spreadsheet: ${sheetId}`);
    console.info(`Range: ${this.requestedRange}`);
    console.info("----------------------------------------");

    try {
      const actualUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${this.requestedRange}?key=${apiKey}`;
      const res = await fetch(actualUrl);
      
      this.httpStatus = res.status;
      
      const text = await res.text();
      this.rawResponsePreview = text.substring(0, 500);

      console.info(`Status: ${res.status}`);

      if (!res.ok) {
        let errMessage = `HTTP ${res.status}`;
        try {
          const errJson = JSON.parse(text);
          if (errJson.error && errJson.error.message) {
            errMessage = errJson.error.message;
          }
        } catch {}

        this.errorMessage = errMessage;
        console.error(`Error: ${errMessage}`);

        if (res.status === 403 || res.status === 401) {
          this.syncStatus = 'error-permission';
        } else if (res.status === 404) {
          this.syncStatus = 'error-not-found';
        } else if (res.status === 400 && text.toLowerCase().includes('range')) {
          this.syncStatus = 'error-invalid-range';
        } else if (res.status === 400) {
          this.syncStatus = 'error-auth';
        } else {
          this.syncStatus = 'error-network';
        }
        return false;
      }

      const json = JSON.parse(text);
      if (json.values && json.values.length > 0) {
        try {
          const parsed = parseGoogleSheetsData(json.values);
          this.data = parsed;
          this.syncStatus = 'live';
          this.lastUpdated = new Date();
          this.rowsReturned = parsed.length;
          this.errorMessage = null;
          console.info(`Rows Returned: ${json.values.length}`);
          return true;
        } catch (parseError: unknown) {
          this.syncStatus = 'error-parser';
          this.errorMessage = (parseError as Error).message || 'Failed to parse Google Sheets data';
          console.error(`Parser Error: ${this.errorMessage}`);
          return false;
        }
      } else {
        this.syncStatus = 'error-parser';
        this.errorMessage = 'No values array returned in response';
        console.error('Error: No values returned');
        return false;
      }
    } catch (error: unknown) {
      this.syncStatus = 'error-network';
      this.errorMessage = (error as Error).message || 'Network error fetching from Google Sheets';
      this.httpStatus = 0;
      console.error(`Network Error: ${this.errorMessage}`);
      return false;
    }
  }

  private async fetchFromCsvUrl(url: string): Promise<boolean> {
    this.source = 'Google Sheets CSV URL';
    this.requestUrl = url.substring(0, Math.min(url.length, 50)) + '...';
    try {
      const res = await fetch(url);
      this.httpStatus = res.status;
      
      const text = await res.text();
      this.rawResponsePreview = text.substring(0, 500);

      if (!res.ok) {
        this.syncStatus = 'error-network';
        this.errorMessage = `HTTP ${res.status}`;
        return false;
      }

      if (text) {
        try {
          const parsed = parseCsvData(text);
          this.data = parsed;
          this.syncStatus = 'csv';
          this.lastUpdated = new Date();
          this.rowsReturned = parsed.length;
          this.errorMessage = null;
          return true;
        } catch (e: unknown) {
          this.syncStatus = 'error-parser';
          this.errorMessage = (e as Error).message || 'Failed to parse CSV';
          return false;
        }
      }
      return false;
    } catch (error: unknown) {
      this.syncStatus = 'error-network';
      this.errorMessage = (error as Error).message || 'Network error fetching CSV';
      return false;
    }
  }

  public async uploadCsvData(csvContent: string): Promise<boolean> {
    try {
      const parsed = parseCsvData(csvContent);
      if (parsed && parsed.length > 0) {
        this.data = parsed;
        this.syncStatus = 'uploaded-csv';
        this.source = 'Uploaded CSV';
        this.lastUpdated = new Date();
        this.rowsReturned = parsed.length;
        this.errorMessage = null;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem("uploaded_csv_data", JSON.stringify(parsed));
          localStorage.setItem("uploaded_csv_timestamp", this.lastUpdated.toISOString());
          localStorage.setItem("uploaded_csv_count", parsed.length.toString());
        }
        
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Failed to parse CSV', error);
      this.syncStatus = 'error-parser';
      this.errorMessage = (error as Error).message || 'Failed to parse uploaded CSV';
      return false;
    }
  }

  public getDiagnostics(): DataDiagnostics {
    return {
      source: this.source,
      syncStatus: this.syncStatus,
      httpStatus: this.httpStatus,
      requestUrl: this.requestUrl,
      spreadsheetId: this.spreadsheetId,
      requestedRange: this.requestedRange,
      rowsReturned: this.rowsReturned,
      lastUpdated: this.lastUpdated,
      errorMessage: this.errorMessage,
      rawResponsePreview: this.rawResponsePreview,
      envApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY,
      envSheetId: !!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID,
      envCsvUrl: !!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL
    };
  }

  public getDataStatus(): DataStatus {
    return {
      totalResponses: this.data.length,
      isConnected: this.syncStatus === 'live' || this.syncStatus === 'csv',
      syncTime: this.lastUpdated,
      syncStatus: this.syncStatus
    };
  }
}

export const dataService = DataService.getInstance();
