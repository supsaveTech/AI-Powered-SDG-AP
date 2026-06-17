# Data Context — Single Source of Truth

## Overview

`src/contexts/DataContext.tsx` is the **Single Source of Truth (SSOT)** for all computed analytics in the platform. Every KPI card, AI insight, and report section consumes values from this context. No component is permitted to independently recalculate metrics.

## AnalyticsContextType

All computed fields available across the application:

```typescript
export interface AnalyticsContextType {
  // Core
  totalRespondents: number;
  communitiesReached: number;

  // Composite Indices (0–100)
  digitalAccessIndex: number;
  digitalSkillsReadiness: number;
  aiReadinessIndex: number;
  careerAwarenessScore: number;
  employmentReadinessIndex: number;

  // Device Ownership Percentages (Q8)
  smartphonePct: number;
  laptopPct: number;
  tabletPct: number;
  desktopPct: number;

  // Access & Connectivity
  aiAdoptionRate: number;       // % who have used an AI tool
  remoteWorkInterest: number;   // % interested in remote work
  goodInternetPct: number;      // % with good/excellent electricity

  // Infrastructure
  topPowerSource: string;

  // Barriers
  topBarrier: string;
  topBarrierScore: number;      // 1–5 severity score
}
```

## Composite Index Calculations

All index functions live in `src/utils/dataAggregation.ts`:

| Index | Function | Source Questions | Formula |
|-------|----------|-----------------|---------|
| Digital Access Index | `calculateDigitalAccessIndex` | Q8, Q9, Q11 | 40% device score + 30% internet reliability + 30% electricity reliability |
| Digital Skills Readiness | `calculateDigitalSkillsReadiness` | Q14–Q17 | Weighted composite of self-reported skills, skill level rating, and coding experience |
| AI Readiness Index | `calculateAIReadinessIndex` | Q18–Q21 | 40% AI adoption + 30% usage frequency + 30% tool diversity |
| Career Awareness Score | `calculateCareerAwarenessScore` | Q22–Q24 | Careers known (breadth) × career interest (Likert) |
| Employment Readiness Index | `calculateEmploymentReadiness` | Q25–Q27 | Alignment of work preferences, desired skills, and remote work orientation |

## Consuming Analytics in Components

```typescript
import { useData } from '@/contexts/DataContext';

export function MyComponent() {
  const { data, analytics, isInitializing } = useData();

  if (!analytics) return null;

  return <div>{analytics.smartphonePct}% smartphone ownership</div>;
}
```

## Passing Analytics to AI Insights

All pages must pass `analytics` to the `<AIInsights>` component so the AI engine reads from the SSOT:

```tsx
<AIInsights
  pageName="Digital Access"
  data={data}
  analytics={analytics}   // ← Required for SSOT compliance
/>
```

## SSOT Enforcement Rules

1. **No component may call** `calculateDigitalSkillsReadiness(data)` or any `dataAggregation` function directly — use `analytics` from `useData()`.
2. **No component may filter raw `data`** to compute device percentages — use `analytics.smartphonePct`, `analytics.laptopPct`, etc.
3. **The RAG context string** (`ragContextBuilder.ts`) must receive `analytics` as its second argument to pull from the SSOT rather than recomputing.
