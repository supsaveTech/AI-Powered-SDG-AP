# AI-Powered SDG Analytics Platform

> **Digital Skills for Decent Work: Mapping Youth Readiness and Digital Career Awareness in Port Harcourt**

[![Live Platform](https://img.shields.io/badge/Live%20Platform-Vercel-brightgreen)](https://ai-powered-sdg-ap.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9C%93-orange)](https://github.com/supsaveTech/AI-Powered-SDG-AP)

---

## Overview

This platform is an open-source, AI-powered analytics dashboard built for the **SDG Advocate Programme (Cohort 8)** to visualize and analyze data from a primary research survey conducted among youth in Port Harcourt, Rivers State, Nigeria.

The research investigates youth digital readiness, AI awareness, and career awareness as a contribution toward:

- **SDG 8 — Decent Work and Economic Growth**: Promoting youth employment and digital skills development.
- **SDG 9 — Industry, Innovation and Infrastructure**: Assessing technology access, infrastructure challenges, and innovation capacity.

The platform transforms raw survey responses into evidence-based visual analytics, AI-generated policy insights, and SDG impact reports — designed to support advocacy, programme design, and evidence-based decision making.

---

## 🌐 Live Demo

**[https://ai-powered-sdg-ap.vercel.app/](https://ai-powered-sdg-ap.vercel.app/)**

---

## Key Features

- **Real-Time Google Sheets Sync** — Live survey data via Google Sheets API; CSV upload fallback available.
- **10 Analytics Dashboard Modules** — Demographics, Digital Access, Skills, AI Awareness, Career Awareness, Employment Readiness, Barriers, Recommendations, Case Study, Methodology.
- **AI Insights Engine** — Page-specific structured insights (key findings, trends, recommendations, SDG mapping) per dashboard section.
- **AI Report Generator** — On-demand 11-section executive research report with full survey question traceability.
- **AI Data Analyst Chatbot** — RAG-backed chatbot grounded in real survey statistics.
- **Single Source of Truth Architecture** — All metrics computed once in `DataContext` and consumed by every component.
- **OpenAI & Gemini Support** — Configurable LLM integration; heuristic engine active with no API key required.
- **Community Name Normalisation** — Fuzzy-matching deduplication of free-text community name entries.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router and API routes |
| **TypeScript** | Type-safe full-stack development |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Analytics visualizations |
| **Framer Motion** | Animations and micro-interactions |
| **Google Sheets API** | Primary live data source |
| **OpenAI / Gemini API** | Optional LLM integration |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/supsaveTech/AI-Powered-SDG-AP.git
cd AI-Powered-SDG-AP

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys (all optional)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.

### Environment Variables

```env
# Google Sheets (Primary Data Source)
GOOGLE_SHEETS_API_KEY=your_api_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id

# Published CSV Fallback
GOOGLE_SHEETS_CSV_URL=https://docs.google.com/spreadsheets/d/.../pub?output=csv

# AI Provider (Optional — heuristic engine used if unset)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

---

## Deployment

Recommended: [Vercel](https://vercel.com/) — connect the repository, add environment variables, and deploy. The platform auto-deploys on every push to `main`.

For other platforms:
```bash
npm run build && npm start
```

---

## Documentation

Detailed technical documentation is in the [`/docs`](./docs) directory:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture, data flow, and component overview |
| [DATA_CONTEXT.md](./docs/DATA_CONTEXT.md) | Single Source of Truth analytics system |
| [GOOGLE_SHEETS_INTEGRATION.md](./docs/GOOGLE_SHEETS_INTEGRATION.md) | Google Sheets sync, parser, and CSV fallback |
| [AI_INSIGHTS_ENGINE.md](./docs/AI_INSIGHTS_ENGINE.md) | AI insights, report generator, and heuristic fallback |
| [ADMIN_DIAGNOSTICS.md](./docs/ADMIN_DIAGNOSTICS.md) | Admin panel features and diagnostics |

---

## Roadmap

- [ ] Multi-language (i18n) support
- [ ] Excel/JSON export formats
- [ ] Longitudinal tracking across survey editions
- [ ] Stratified sampling support for future surveys
- [ ] Additional Rivers State LGA coverage

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

Developed as part of the **SDG Advocate Programme (Cohort 8)** in partnership with youth organisations and educational institutions in Port Harcourt, Rivers State, Nigeria.

*Built with ❤️ for youth empowerment and digital inclusion in Nigeria.*
