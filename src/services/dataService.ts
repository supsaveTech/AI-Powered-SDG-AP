import { SurveyResponse } from '../types';
import { mockSurveyData } from '../data/mockData';

// This service will act as a facade for the Google Sheets API in production
export class DataService {
  private static instance: DataService;
  private data: SurveyResponse[] = [];
  private lastSyncTime: Date | null = null;
  private isMock: boolean = true; // Set to false when integrating real Google Sheets

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Fetch data from Google Sheets (mocked for now)
   */
  public async fetchData(forceRefresh: boolean = false): Promise<SurveyResponse[]> {
    if (this.data.length > 0 && !forceRefresh) {
      return this.data;
    }

    if (this.isMock) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      this.data = mockSurveyData;
      this.lastSyncTime = new Date();
      return this.data;
    }

    // TODO: Implement Google Sheets API fetch here
    // Example:
    // const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A1:Z1000?key=${API_KEY}`);
    // const json = await res.json();
    // this.data = this.parseGoogleSheetsData(json.values);
    // this.lastSyncTime = new Date();
    
    return this.data;
  }

  /**
   * Upload CSV data from Admin Panel
   */
  public async uploadCsvData(csvContent: string): Promise<boolean> {
    try {
      // Simulate parsing and validation
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, parse the CSV and convert it to SurveyResponse[]
      // this.data = parseCsv(csvContent);
      this.lastSyncTime = new Date();
      return true;
    } catch (error) {
      console.error('Failed to parse CSV', error);
      return false;
    }
  }

  public getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  public getDataStatus(): { totalResponses: number; isConnected: boolean; syncTime: Date | null } {
    return {
      totalResponses: this.data.length,
      isConnected: !this.isMock,
      syncTime: this.lastSyncTime
    };
  }
}

export const dataService = DataService.getInstance();
