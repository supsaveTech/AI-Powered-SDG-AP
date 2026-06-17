# Admin Panel & Diagnostics

## Overview

The Admin Panel (`/admin`) is the operational control centre for the platform. It provides data management, sync controls, diagnostics, and community name configuration.

**Default Password**: `admin2025` (change this in production by updating the constant in `AdminDashboard.tsx`)

## Sections

### 1. Google Sheets Sync Status

Displays the current data source status badge:
- 🟢 **Live Google Sheets Sync** — reading from Google Sheets API
- 🟡 **Published CSV Sync** — reading from published CSV URL
- 🔴 **Offline / Demo Mode** — no live source available

Diagnostic fields shown:
- HTTP Status code of last sync
- Rows returned
- Last sync timestamp
- Startup log messages

### 2. Live Parsed Data Totals

A grid of pre-computed analytics values from `DataContext` (SSOT):
- Smartphone %, Laptop %, Tablet %, Desktop %
- Career Interest Score, Digital Skills Readiness
- AI Readiness Index, Employment Readiness
- Top Barrier, Total Respondents, AI Usage count

### 3. Raw Data Diagnostic Table

A critical debugging tool showing the **exact raw strings** from Google Sheets for the first 5 respondents:

| Column | Source | Purpose |
|--------|--------|---------|
| Raw Devices | Q8 | Verify exact delimiter and device label format |
| Raw Work Type | Q25 | Verify exact preferred work type string |
| Raw Career Interest | Q23 | Verify exact career interest response |

Use this table to diagnose:
- **Cause A**: Wrong labels (e.g., sheet says "Mobile Phone" not "Smartphone")
- **Cause B**: Delimiter issues (semicolons vs. commas)
- **Cause C**: Case sensitivity
- **Cause D**: Whitespace in headers

### 4. Trigger Sync Button

Forces an immediate re-fetch from the configured Google Sheets endpoint. Also available by pressing the sync button in the header navigation.

### 5. Raw API Response Preview

Expandable panel showing the first ~500 characters of the raw API response. Useful for confirming the API is returning data in the expected format.

### 6. Startup Diagnostics Log

Chronological log of events during the last data load cycle, including:
- Which headers were detected
- Which headers fell back to positional index
- Missing header warnings

### 7. CSV Upload Fallback

Drag-and-drop / click-to-upload interface for manually loading a CSV export from Google Forms. The uploaded CSV is:
- Parsed immediately using `csvParser.ts`
- Cached in `localStorage` under the key `survey_csv_cache`
- Used as the data source on subsequent page loads if no API source is available

### 8. Survey Monitoring

Line chart showing cumulative and daily survey response volume over time, with first and latest response dates displayed.

### 9. Community Name Management

Table of all detected community names with options to:
- Set a **canonical name** for any raw name variant
- Mark names as **accepted** or **flagged**
- Define custom mappings via the override form

Overrides are stored in `localStorage` and applied by `communityNormalizer.ts` during data aggregation.

## Common Diagnostics

### All device ownership shows 0%

1. Open the Raw Data Diagnostic table
2. Check the `Raw Devices` column for rows 1–5
3. If values show `N/A`, the Q8 column header is not being detected — check the Startup Diagnostics Log for the warning message
4. If values show a string like `"Mobile Phone, Laptop Computer"`, update the device matching in `googleSheetsParser.ts` to include these label variants

### Remote Work Interest shows 0%

Check the Raw Work Type column. If values are showing correctly but the count is still 0, the string doesn't contain any of the keywords: `remote`, `hybrid`, `freelance`, `work from home`, `distributed`. Add the observed value to the keyword list in `googleSheetsParser.ts`.

### Headers mapped to wrong questions

Review the Startup Diagnostics Log. Lines like:
```
[GoogleSheetsParser] Could not find header matching: X OR Y. Falling back to index N
```
indicate that the fallback positional index is being used, which may be incorrect if the sheet has a different column order.
