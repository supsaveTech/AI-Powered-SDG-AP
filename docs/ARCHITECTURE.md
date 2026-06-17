# Architecture Overview

## System Architecture

The platform is a **Next.js 15** full-stack application with the following layers:

```
Google Forms (Survey Collection)
        ↓
Google Sheets (Response Storage)
        ↓
Google Sheets API  ←──── or ────→  Published CSV URL
        ↓                                  ↓
   DataService Layer (src/services/dataService.ts)
        ↓
Community Normalization (src/utils/communityNormalizer.ts)
        ↓
Google Sheets Parser (src/services/googleSheetsParser.ts)
        ↓
DataContext — Single Source of Truth (src/contexts/DataContext.tsx)
        ↓                    ↓                    ↓
  Analytics Pages     AI Insights Engine    Report Generator
                     (src/services/aiService.ts)
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── chat/           # AI chatbot API route
│   │   ├── insights/       # AI page insights API route
│   │   └── sync/           # Google Sheets sync API route
│   ├── demographics/
│   ├── digital-access/
│   ├── digital-skills/
│   ├── ai-awareness/
│   ├── career-awareness/
│   ├── employment-readiness/
│   ├── barriers/
│   ├── recommendations/
│   ├── methodology/
│   ├── school-observation/
│   └── admin/
├── components/
│   ├── ai/                 # AIInsights, ReportGenerator
│   ├── charts/             # BarChart, PieChart wrappers
│   ├── dashboard/          # ImpactCounters, SyncStatusBar
│   └── ui/                 # Shared UI primitives
├── contexts/
│   └── DataContext.tsx     # SSOT analytics computation
├── services/
│   ├── aiService.ts        # AI engine (LLM + heuristic)
│   ├── dataService.ts      # Data fetching orchestration
│   ├── googleSheetsParser.ts # Header mapping & normalization
│   └── csvParser.ts        # CSV parsing fallback
├── types/
│   └── index.ts            # SurveyResponse, LikertScale types
└── utils/
    ├── dataAggregation.ts  # Index calculation functions
    ├── ragContextBuilder.ts # RAG context string builder
    ├── insightEngine.ts    # Dynamic insight generation
    └── communityNormalizer.ts # Fuzzy community deduplication
```

## Data Source Priority Chain

The platform resolves data in this order:
1. **Google Sheets API** (`GOOGLE_SHEETS_API_KEY` + `GOOGLE_SHEETS_SPREADSHEET_ID`)
2. **Published CSV URL** (`GOOGLE_SHEETS_CSV_URL`)
3. **Admin-uploaded CSV** (uploaded via the Admin Panel, cached in `localStorage`)
4. **Demonstration data** (built-in mock dataset, clearly labelled in UI)

## Key Design Decisions

- **Single Source of Truth**: All composite index calculations happen once in `DataContext.tsx`. No component recalculates metrics independently.
- **RAG Architecture**: The AI chatbot and insights engine receive a pre-built context string from `ragContextBuilder.ts`, which pulls values from `DataContext` analytics — ensuring the AI always reflects the same numbers displayed in the UI.
- **Heuristic Fallback**: When no LLM API key is configured, the AI engine uses a sophisticated pattern-matching heuristic engine that produces contextual, data-driven responses without any external dependencies.
