import { SurveyResponse } from "../types";

export const exportToCsv = (data: SurveyResponse[], filename: string = "digital_skills_data.csv") => {
  if (!data || !data.length) {
    return;
  }

  // Define headers based on the SurveyResponse keys
  const headers = Object.keys(data[0]) as (keyof SurveyResponse)[];
  
  // Convert data to CSV string
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape strings containing commas by wrapping in quotes
      const stringValue = String(value);
      if (stringValue.includes(',')) {
        return `"${stringValue}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  
  // Create a blob and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
