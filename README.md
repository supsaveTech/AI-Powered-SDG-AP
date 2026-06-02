# Digital Skills for Decent Work - SDG Analytics Platform

## Project Overview
This project is a production-ready, open-source SDG analytics platform built for the **Digital Skills for Decent Work** initiative (SDG Advocate Programme Cohort 8). 

**Project Lead:** Charles Mitchel (Participant ID: C8/M/RIV/061)  
**Case Study:** Port Harcourt, Rivers State, Nigeria  
**Primary SDGs:** SDG 8 (Decent Work and Economic Growth) & SDG 9 (Industry, Innovation and Infrastructure)  
**Live Demo:** [https://ai-powered-sdg-ap.vercel.app/](https://ai-powered-sdg-ap.vercel.app/)

The platform assesses youth readiness for participation in the digital economy by analyzing digital access, digital skills, technology career awareness, employment readiness, and barriers to learning. It functions as both a public SDG impact dashboard and a digital research analytics platform.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Data Source:** Google Sheets API (Mock data generated for initial development)

## Installation Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-skills-sdg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Google Sheets Setup (Production)

The platform currently uses mock data. To connect to a live Google Sheet:

1. Create a Google Cloud Project and enable the **Google Sheets API**.
2. Create a **Service Account** and download the JSON key.
3. Share your survey responses Google Sheet with the Service Account email.
4. Update `src/services/dataService.ts` to implement the `fetchData` function using the `googleapis` package or a REST call.

## Environment Variables
Create a `.env.local` file in the root directory:

```env
GOOGLE_SHEETS_API_KEY=your_api_key
SPREADSHEET_ID=your_spreadsheet_id
```

## Deployment Guide (Vercel)

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import the GitHub repository.
4. Configure Environment Variables in the Vercel dashboard.
5. Click **Deploy**.

## Contribution Guide
Contributions are welcome! Please follow the conventional commits standard. Ensure you run `npm run lint` and `npm run build` before opening a pull request to verify no type errors or broken builds exist.

## Open Source License
This project is licensed under the MIT License - see the LICENSE file for details.
