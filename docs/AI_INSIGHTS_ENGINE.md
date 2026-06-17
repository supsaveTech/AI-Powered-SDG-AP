# AI Insights Engine

## Overview

The AI layer consists of three components:
1. **AI Insights Engine** — Generates structured, page-specific insights for each dashboard section
2. **AI Report Generator** — Produces an 11-section professional research report on demand
3. **AI Data Analyst Chatbot** — Answers freeform questions grounded in real survey data

All three components fall back to a sophisticated **heuristic engine** when no LLM API key is configured, ensuring full functionality with zero external dependencies.

## Provider Selection

`src/services/aiService.ts` selects the AI provider at startup:

```typescript
const AI_PROVIDER = process.env.OPENAI_API_KEY ? 'openai' :
                   process.env.GEMINI_API_KEY ? 'gemini' : 'heuristic';
```

Supported providers:
- **OpenAI** (GPT-4o-mini) — set `OPENAI_API_KEY`
- **Gemini** (Gemini 1.5 Flash) — set `GEMINI_API_KEY`
- **Heuristic** — no key required; default

## RAG Architecture

All AI calls are grounded via a RAG context string built by `src/utils/ragContextBuilder.ts`.

### Context String Format

```
=== SURVEY DATASET CONTEXT ===
Total Survey Respondents: 45

=== DEMOGRAPHICS ===
- Predominant gender: Male (58%) [Source: Q2]
- Top location: Woji (22%) [Source: Q3]
- Communities covered:
  1. Woji: 22%
  2. Elelenwo: 18%
  ...

=== DIGITAL ACCESS & INFRASTRUCTURE [Q6-Q15] ===
- Digital Access Index: 62/100
- Smartphone ownership: 87%
- Laptop ownership: 34%
...

=== BARRIERS TO LEARNING [Q28-Q29] ===
Top Barriers (severity 1-5):
1. Cost of Training: 4.20/5
2. Lack of Device: 3.85/5
...
```

### SSOT Integration

The RAG context builder accepts pre-computed `AnalyticsContextType` from `DataContext` as its second argument, ensuring the AI always uses the same values displayed in the UI:

```typescript
buildRAGContext(data, analytics)  // analytics from DataContext SSOT
```

## Page-Specific Insights

`generatePageInsights(pageName, ragContext)` in `aiService.ts` generates an `AIInsightSet`:

```typescript
interface AIInsightSet {
  keyFindings: string[];
  trendAnalysis: string[];
  recommendations: string[];
  sdgMapping: {
    sdg8: string[];
    sdg9: string[];
  };
}
```

### Supported Pages

| Page Name | Insight Focus |
|-----------|--------------|
| `Overview` | Overall findings, respondent profile, major trends |
| `Demographics` | Age, gender, education, community distribution |
| `Digital Access` | Devices, connectivity, electricity, infrastructure |
| `Digital Skills` | Skill gaps, coding experience, readiness levels |
| `AI Awareness` | AI tool usage, adoption trends, professional vs. consumer use |
| `Career Awareness` | Tech career familiarity, career interest, preferred fields |
| `Employment Readiness` | Work preferences, remote work, employability |
| `Barriers` | Barrier severity ranking, support needs |
| `Recommendations` | Intervention priorities, roadmap, impact |
| `Methodology` | Sample size, limitations, design notes |
| `School Observation` | Field observation at Lift Up Child Education Centre |

## AI Report Generator

`generateHeuristicReport(ragContext)` produces a structured 11-section report:

1. Executive Summary
2. Demographics Analysis
3. Community Distribution
4. Digital Access Analysis (Q8–Q13)
5. Digital Skills Analysis (Q14–Q17)
6. AI Awareness Analysis (Q18–Q21)
7. Career Awareness Analysis (Q22–Q24)
8. Employment Readiness Analysis (Q25–Q27)
9. Barrier Analysis (Q27–Q29)
10. SDG Mapping (SDG 8 & 9 target alignment)
11. Strategic Recommendations

Each section dynamically inserts actual survey percentages and generates contextual narrative commentary (e.g., if smartphone > 1.5× laptop, generates mobile-first ecosystem narrative).

### Validation Guard

If device ownership data is entirely zero (indicating a parser failure), the report returns a diagnostic message instead of fabricating analysis:

```typescript
if (smartphone === 0 && laptop === 0 && accessIndex === 0) {
  return `WARNING: Device ownership data could not be verified...
  Please visit Admin Dashboard to check column mapping.`;
}
```

## System Prompt

The LLM system prompt instructs the model to:
- Ground all responses in the provided RAG context statistics
- Reference specific survey question numbers (e.g., Q18, Q23)
- Target SDG 8 and SDG 9 specifically
- Never fabricate data points not present in the context
