import { parseGoogleSheetsData, ParseResult } from './googleSheetsParser';
import { SurveyResponse } from '@/types';

/**
 * Parses raw CSV string data into SurveyResponse array.
 * We reuse the logic from googleSheetsParser by converting the CSV into a 2D array first.
 */
export function parseCsvData(csvText: string): ParseResult {
  if (!csvText) {
    return {
      data: [],
      validation: {
        missingHeaders: [], unexpectedHeaders: [], duplicateHeaders: [],
        isValid: false, detectedHeaders: [], columnIndexMap: {}
      }
    };
  }
  
  // Simple CSV parser that handles basic comma separation and quotes.
  // For production, a library like PapaParse might be better, but this works for standard Google Forms CSVs.
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"' && inQuotes && nextChar === '"') {
      currentCell += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++; // skip \n
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  // Push the last cell/row if not empty
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  // Pass to the shared mapping logic
  return parseGoogleSheetsData(rows);
}
