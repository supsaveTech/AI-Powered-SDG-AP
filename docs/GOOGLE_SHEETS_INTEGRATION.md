# Google Sheets Integration

## Overview

The platform reads live survey data from a Google Forms-backed Google Spreadsheet via the Google Sheets REST API. A cascade of fallbacks ensures the platform always has data even when primary sources are unavailable.

## Data Source Priority Chain

| Priority | Source | Configuration |
|----------|--------|--------------|
| 1 | Google Sheets API | `GOOGLE_SHEETS_API_KEY` + `GOOGLE_SHEETS_SPREADSHEET_ID` |
| 2 | Published CSV URL | `GOOGLE_SHEETS_CSV_URL` |
| 3 | Admin-Uploaded CSV | Uploaded via `/admin`, cached in `localStorage` |
| 4 | Demonstration Data | Built-in mock dataset — UI shows "Demo Mode" banner |

## Environment Setup

```env
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_ID/pub?output=csv
```

The Spreadsheet ID is the long alphanumeric string in your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`

## Header Mapping (Parser)

`src/services/googleSheetsParser.ts` maps raw Google Forms column headers to typed `SurveyResponse` fields.

### How `getIndex` Works

The parser normalizes all headers to lowercase and uses substring matching against a priority-ordered list of search terms:

```typescript
const getIndex = (searchTerms: string[], fallbackIndex?: number): number => {
  const idx = headers.findIndex(header =>
    searchTerms.some(term => header.includes(normalizeHeader(term)))
  );
  if (idx === -1 && fallbackIndex !== undefined) {
    console.warn(`Could not find header: ${searchTerms.join(' OR ')}. Falling back to index ${fallbackIndex}`);
    return fallbackIndex;
  }
  return idx;
};
```

### Survey Question → Parser Field Mapping

| Q# | Google Forms Header (partial) | Parser Field | Search Terms |
|----|------------------------------|-------------|-------------|
| Q3 | Age group | `age` | `['age group', 'age ']` |
| Q4 | Gender | `gender` | `['gender']` |
| Q5 | Area/Community | `location` | `['area/community', 'reside in', 'community']` |
| Q8 | Devices you have access to | `devices[]` → booleans | `['device', 'access to', 'smartphone', 'laptop']` |
| Q9 | How reliable is your internet | `internetReliability` | `['reliable is your internet', 'internet access']` |
| Q11 | How reliable is electricity | `electricityReliability` | `['reliable is electricity', 'power supply']` |
| Q13 | How does electricity affect your ability | `electricityImpact` | `['unreliable electricity affect', 'affect your ability to learn']` |
| Q18 | Have you used an AI tool | `hasUsedAI` | `['used an ai tool before', 'have you used an ai']` |
| Q23 | Would you consider a career in technology | `careerInterest` | `['consider a career in technology']` |
| Q25 | What type of work are you most interested | `preferredWorkType` | `['type of work', 'work are you most interested']` |
| Q26 | Which digital skills would you most like | `desiredSkills[]` | `['digital skills would you most like', 'skills would you most like']` |
| Q27 | What prevents you from learning | `barriersToLearning[]` | `['prevents you from learning digital skills']` |

> **Important**: Search terms must be specific enough to avoid substring collisions. For example, Q13 uses `'affect your ability to learn'` rather than generic `'impact'` to avoid matching Q26 headers.

## Device Ownership Parsing

Q8 returns a comma/semicolon delimited list (e.g., `"Smartphone, Laptop"`). The parser normalizes each entry:

```typescript
ownsSmartphone: devicesList.some(d =>
  d.toLowerCase().includes('smartphone') ||
  d.toLowerCase().includes('phone') ||
  d.toLowerCase().includes('mobile')
),
ownsLaptop: devicesList.some(d =>
  d.toLowerCase().includes('laptop') ||
  d.toLowerCase().includes('computer') ||
  d.toLowerCase().includes('macbook')
),
```

## Remote Work Parsing

Q25 (`preferredWorkType`) is normalized to detect remote/flexible work orientation:

```typescript
interestInRemoteWork: (() => {
  const wt = parseStr(row, idxWorkType).toLowerCase();
  if (wt.includes('remote') || wt.includes('hybrid') ||
      wt.includes('freelance') || wt.includes('work from home') ||
      wt.includes('distributed')) {
    return 'Agree';
  }
  return 'Neutral';
})()
```

## Raw Data Diagnostics

The Admin Dashboard (`/admin`) exposes a **Raw Data Diagnostic** table showing the first 5 respondents' raw values for:
- `rawDevices` — exact string from Q8 column
- `rawWorkType` — exact string from Q25 column
- `rawCareerInterest` — exact string from Q23 column

Use this to identify parsing failures caused by unexpected column header formats or delimiter differences.

## Sync Mechanism

The `/api/sync` route fetches data server-side and returns it to the client. The `DataContext` caches the result in `localStorage` with a TTL, so data persists across page refreshes without additional API calls.
