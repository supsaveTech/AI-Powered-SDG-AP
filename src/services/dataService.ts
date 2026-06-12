import { SurveyResponse } from '../types';
import { mockSurveyData } from '../data/mockData';
import { parseGoogleSheetsData } from './googleSheetsParser';
import { parseCsvData } from './csvParser';

export type SyncStatus = 'sheets-api' | 'sheets-csv' | 'uploaded-csv' | 'mock' | 'offline';

export interface DataStatus {
  totalResponses: number;
  isConnected: boolean;
  syncTime: Date | null;
  syncStatus: SyncStatus;
}

export class DataService {
  private static instance: DataService;
  private data: SurveyResponse[] = [];
  private lastSyncTime: Date | null = null;
  private syncStatus: SyncStatus = 'offline';

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Fetch data with priority fallback: API -> CSV URL -> Uploaded -> Mock
   */
  public async fetchData(forceRefresh: boolean = false): Promise<SurveyResponse[]> {
    if (this.data.length > 0 && !forceRefresh) {
      return this.data;
    }

    // 1. Try Google Sheets API
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
      const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID;
      
      if (apiKey && sheetId) {
        const data = await this.fetchFromGoogleSheets(apiKey, sheetId);
        if (data && data.length > 0) {
          this.data = data;
          this.syncStatus = 'sheets-api';
          this.lastSyncTime = new Date();
          return this.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch from Google Sheets API, falling back...", e);
    }

    // 2. Try Published CSV URL
    try {
      const csvUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL;
      if (csvUrl) {
        const data = await this.fetchFromCsvUrl(csvUrl);
        if (data && data.length > 0) {
          this.data = data;
          this.syncStatus = 'sheets-csv';
          this.lastSyncTime = new Date();
          return this.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch from CSV URL, falling back...", e);
    }

    // 3. Try Uploaded CSV / Cache
    // If we already have data from an uploaded CSV, keep it
    if (this.data.length > 0 && this.syncStatus === 'uploaded-csv') {
      return this.data;
    }

    // 4. Mock Data Fallback
    console.warn("Using mock data fallback.");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network
    this.data = mockSurveyData;
    this.syncStatus = 'mock';
    this.lastSyncTime = new Date();
    
    return this.data;
  }

  private async fetchFromGoogleSheets(apiKey: string, sheetId: string): Promise<SurveyResponse[] | null> {
    // Note: Form Responses sheets usually have 'Form Responses 1' as the name.
    // If it fails, one might need to fetch spreadsheet metadata first, but typically this is default.
    // However, if we omit sheet name, range 'A1:ZZ1000' usually gets the first sheet.
    const range = 'A1:ZZ1000'; 
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`);
    if (!res.ok) {
      throw new Error(`Sheets API responded with ${res.status}`);
    }
    const json = await res.json();
    if (json.values && json.values.length > 0) {
      return parseGoogleSheetsData(json.values);
    }
    return null;
  }

  private async fetchFromCsvUrl(url: string): Promise<SurveyResponse[] | null> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`CSV fetch responded with ${res.status}`);
    }
    const csvText = await res.text();
    if (csvText) {
      return parseCsvData(csvText);
    }
    return null;
  }

  /**
   * Upload CSV data from Admin Panel
   */
  public async uploadCsvData(csvContent: string): Promise<boolean> {
    try {
      const parsed = parseCsvData(csvContent);
      if (parsed && parsed.length > 0) {
        this.data = parsed;
        this.syncStatus = 'uploaded-csv';
        this.lastSyncTime = new Date();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to parse CSV', error);
      return false;
    }
  }

  public getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  public getDataStatus(): { totalResponses: number; isConnected: boolean; syncTime: Date | null; syncStatus: SyncStatus } {
    return {
      totalResponses: this.data.length,
      isConnected: this.syncStatus === 'sheets-api' || this.syncStatus === 'sheets-csv',
      syncTime: this.lastSyncTime,
      syncStatus: this.syncStatus
    };
  }
}

export const dataService = DataService.getInstance();
