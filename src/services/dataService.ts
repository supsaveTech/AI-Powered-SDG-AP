import { SurveyResponse } from '../types';
import { parseGoogleSheetsData } from './googleSheetsParser';
import { parseCsvData } from './csvParser';

export type SyncStatus = 
  | 'live' 
  | 'csv' 
  | 'uploaded-csv'
  | 'cached-csv'
  | 'cached-sheets'
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
  restoredFromCache: boolean;
  startupLog: string[];
}

export interface DataStatus {
  totalResponses: number;
  isConnected: boolean;
  syncTime: Date | null;
  syncStatus: SyncStatus;
}

const SHEETS_CACHE_KEY = 'sheets_data_cache';
const SHEETS_CACHE_META_KEY = 'sheets_data_cache_meta';
const CSV_DATA_KEY = 'uploaded_csv_data';
const CSV_TIMESTAMP_KEY = 'uploaded_csv_timestamp';

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
  private restoredFromCache: boolean = false;
  private startupLog: string[] = [];

  private constructor() {
    this.log('[Startup] DataService initializing...');
    this.tryRestoreAnyCache();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private log(msg: string) {
    const entry = `${new Date().toISOString().split('T')[1].split('.')[0]} ${msg}`;
    this.startupLog.push(entry);
    console.info(`[DataService] ${msg}`);
  }

  /**
   * Try to restore the best available cached dataset on startup.
   * Priority: uploaded CSV > cached Google Sheets
   */
  private tryRestoreAnyCache() {
    if (typeof window === 'undefined') {
      this.log('[Startup] Server-side: skipping localStorage restore.');
      return;
    }

    // 1. Try uploaded CSV first (user explicitly uploaded)
    try {
      const csvData = localStorage.getItem(CSV_DATA_KEY);
      if (csvData) {
        const parsed = JSON.parse(csvData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.data = parsed;
          this.syncStatus = 'cached-csv';
          this.source = 'Cached CSV (localStorage)';
          this.rowsReturned = parsed.length;
          const ts = localStorage.getItem(CSV_TIMESTAMP_KEY);
          this.lastUpdated = ts ? new Date(ts) : new Date();
          this.restoredFromCache = true;
          this.log(`[Startup] Restored ${parsed.length} records from uploaded CSV cache.`);
          return;
        }
      }
    } catch (e) {
      this.log(`[Startup] Failed to restore CSV cache: ${(e as Error).message}`);
    }

    // 2. Try cached Google Sheets data
    try {
      const sheetsData = localStorage.getItem(SHEETS_CACHE_KEY);
      if (sheetsData) {
        const parsed = JSON.parse(sheetsData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.data = parsed;
          this.syncStatus = 'cached-sheets';
          this.source = 'Google Sheets API (cached)';
          this.rowsReturned = parsed.length;
          const meta = localStorage.getItem(SHEETS_CACHE_META_KEY);
          if (meta) {
            const metaObj = JSON.parse(meta);
            this.lastUpdated = metaObj.lastUpdated ? new Date(metaObj.lastUpdated) : new Date();
            this.spreadsheetId = metaObj.spreadsheetId || null;
            this.requestedRange = metaObj.requestedRange || null;
          }
          this.restoredFromCache = true;
          this.log(`[Startup] Restored ${parsed.length} records from Google Sheets cache.`);
          return;
        }
      }
    } catch (e) {
      this.log(`[Startup] Failed to restore Sheets cache: ${(e as Error).message}`);
    }

    this.log('[Startup] No cached data found. Will fetch from source on first request.');
  }

  /**
   * Persist Google Sheets data to localStorage for refresh survival.
   */
  private persistSheetsData(data: SurveyResponse[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SHEETS_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(SHEETS_CACHE_META_KEY, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        spreadsheetId: this.spreadsheetId,
        requestedRange: this.requestedRange,
        rowsReturned: data.length,
      }));
      this.log(`[Sync] Persisted ${data.length} records to localStorage cache.`);
    } catch (e) {
      this.log(`[Sync] Failed to persist to localStorage: ${(e as Error).message}`);
    }
  }

  public async fetchData(forceRefresh: boolean = false): Promise<SurveyResponse[]> {
    // Return cached in-memory data if valid and not forced
    const isErrorState = this.syncStatus.startsWith('error-');
    if (this.data.length > 0 && !forceRefresh && !isErrorState && this.syncStatus !== 'offline') {
      return this.data;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID;
    const csvUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL;

    this.log(`[Fetch] Starting data fetch. forceRefresh=${forceRefresh}`);
    this.log(`[Fetch] Env: apiKey=${!!apiKey}, sheetId=${!!sheetId}, csvUrl=${!!csvUrl}`);

    // 1. Try Google Sheets API
    if (apiKey && sheetId) {
      this.log('[Fetch] Attempting Google Sheets API...');
      const success = await this.fetchFromGoogleSheets(apiKey, sheetId);
      if (success) {
        this.log(`[Fetch] Google Sheets API success. ${this.data.length} rows loaded.`);
        this.persistSheetsData(this.data);
        return this.data;
      }
      this.log(`[Fetch] Google Sheets API failed: ${this.errorMessage}. NOT falling back to mock.`);
      // Return whatever cache we have (may be stale cached-sheets data from restoration)
      return this.data;
    }

    // 2. Try Published CSV URL
    if (csvUrl) {
      this.log('[Fetch] Attempting CSV URL...');
      const success = await this.fetchFromCsvUrl(csvUrl);
      if (success) {
        this.log(`[Fetch] CSV URL success. ${this.data.length} rows loaded.`);
        return this.data;
      }
      this.log(`[Fetch] CSV URL failed: ${this.errorMessage}.`);
      return this.data;
    }

    // 3. Cached/Uploaded CSV (already restored in constructor, just return)
    if (this.data.length > 0 && (this.syncStatus === 'uploaded-csv' || this.syncStatus === 'cached-csv' || this.syncStatus === 'cached-sheets')) {
      this.log(`[Fetch] Returning cached data (${this.syncStatus}). ${this.data.length} rows.`);
      return this.data;
    }

    // 4. No configuration at all → error-env
    if (!apiKey && !sheetId && !csvUrl) {
      this.syncStatus = 'error-env';
      this.errorMessage = 'No data source configured. Set NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY and SPREADSHEET_ID.';
      this.source = 'None';
      this.log('[Fetch] error-env: no env vars set. Returning empty data.');
      this.data = [];
      this.lastUpdated = new Date();
      this.rowsReturned = 0;
    }

    return this.data;
  }

  private async fetchFromGoogleSheets(apiKey: string, sheetId: string): Promise<boolean> {
    this.spreadsheetId = sheetId;
    this.requestedRange = 'Form Responses 1!A:Z';
    this.requestUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${this.requestedRange}?key=***HIDDEN***`;
    this.source = 'Google Sheets API';

    console.info('----------------------------------------');
    console.info('Google Sheets Request');
    console.info(`URL: ${this.requestUrl}`);
    console.info(`Spreadsheet: ${sheetId}`);
    console.info(`Range: ${this.requestedRange}`);
    console.info('----------------------------------------');

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
          if (errJson.error?.message) errMessage = errJson.error.message;
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
      this.errorMessage = (error as Error).message || 'Network error';
      this.httpStatus = 0;
      console.error(`Network Error: ${this.errorMessage}`);
      return false;
    }
  }

  private async fetchFromCsvUrl(url: string): Promise<boolean> {
    this.source = 'Google Sheets CSV URL';
    this.requestUrl = url.substring(0, 50) + '...';
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
      this.errorMessage = (error as Error).message || 'Network error';
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
          localStorage.setItem(CSV_DATA_KEY, JSON.stringify(parsed));
          localStorage.setItem(CSV_TIMESTAMP_KEY, this.lastUpdated.toISOString());
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
      envCsvUrl: !!process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL,
      restoredFromCache: this.restoredFromCache,
      startupLog: [...this.startupLog],
    };
  }

  public getDataStatus(): DataStatus {
    return {
      totalResponses: this.data.length,
      isConnected: this.syncStatus === 'live' || this.syncStatus === 'csv',
      syncTime: this.lastUpdated,
      syncStatus: this.syncStatus,
    };
  }
}

export const dataService = DataService.getInstance();
