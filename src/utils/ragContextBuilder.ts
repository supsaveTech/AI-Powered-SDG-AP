import { SurveyResponse } from "../types";
import {
  calculateDigitalSkillsReadiness,
  calculateCareerAwarenessScore,
  calculateEmploymentReadiness,
  calculateAIReadinessIndex,
  calculateDigitalAccessIndex,
  calculateBarrierSeverity,
  getDemographics,
  getAIAwarenessMetrics,
  getInfrastructureMetrics
} from "./dataAggregation";

/**
 * Builds a rich textual context summary from aggregated survey data.
 * This is injected as the RAG context into AI system prompts so the
 * AI can answer questions grounded in real data.
 */
export function buildRAGContext(data: SurveyResponse[]): string {
  if (!data || data.length === 0) {
    return "No survey data is currently available.";
  }

  const total = data.length;
  const demographics = getDemographics(data);
  const barriers = calculateBarrierSeverity(data);
  const aiMetrics = getAIAwarenessMetrics(data);
  const infraMetrics = getInfrastructureMetrics(data);

  const digitalSkillsScore = calculateDigitalSkillsReadiness(data).toFixed(1);
  const techInterestScore = calculateCareerAwarenessScore(data).toFixed(1);
  const employmentReadinessScore = calculateEmploymentReadiness(data).toFixed(1);
  const aiReadinessScore = calculateAIReadinessIndex(data).toFixed(1);
  const accessScore = calculateDigitalAccessIndex(data).toFixed(1);

  const topGender = demographics.gender[0];
  const topLocation = demographics.location[0];

  const goodInternetPct = infraMetrics.electricityReliability
    .filter(i => i.name.toLowerCase().includes('good') || i.name.toLowerCase().includes('excellent'))
    .reduce((acc, curr) => acc + curr.value, 0) / total * 100;

  const notice = "Based on responses collected from youths in Port Harcourt...";

  // --- Build context string ---
  const context = `
=== DATA SOURCE NOTICE ===
${notice}
=== SURVEY DATASET CONTEXT ===
Project: Digital Skills for Decent Work
Location: Port Harcourt, Rivers State, Nigeria
Total Survey Respondents: ${total}

=== DEMOGRAPHICS ===
- Predominant gender: ${topGender?.name} (${Math.round(((topGender?.value || 0) / total) * 100)}%) [Source: Q2]
- Top location: ${topLocation?.name} (${Math.round(((topLocation?.value || 0) / total) * 100)}%) [Source: Q3]

=== DIGITAL ACCESS & INFRASTRUCTURE [Q6-Q15] ===
- Digital Access Index: ${accessScore}/100
- Good/Excellent Electricity Reliability: ${goodInternetPct.toFixed(1)}% [Source: Q12]
- Top Power Source: ${infraMetrics.powerSource[0]?.name || 'Unknown'} [Source: Q13]

=== DIGITAL SKILLS [Q16-Q18] ===
- Overall Digital Skills Readiness Score: ${digitalSkillsScore}/100

=== AI AWARENESS [Q19-Q22] ===
- AI Readiness Index: ${aiReadinessScore}/100
- AI Adoption Rate (Has used AI): ${aiMetrics.aiAdoptionRate}% [Source: Q19]
- Top AI Tools: ${aiMetrics.topTools.map(t => t.name).join(', ')} [Source: Q20]

=== TECHNOLOGY CAREER AWARENESS [Q23-Q25] ===
- Technology Career Awareness Score: ${techInterestScore}/100

=== EMPLOYMENT READINESS [Q26-Q27] ===
- Employment Readiness Index: ${employmentReadinessScore}/100

=== BARRIERS TO LEARNING [Q28-Q29] ===
Top Barriers (severity 1-5):
${barriers.slice(0, 5).map((b, i) => `${i + 1}. ${b.name}: ${b.score.toFixed(2)}/5`).join("\n")}

=== QUALITATIVE THEMES [Q30-Q31] ===
- Users heavily request hardware (laptops) and internet data assistance.
`;

  return context.trim();
}

/**
 * Builds a focused context snippet for a specific page of the dashboard.
 */
export function buildPageContext(data: SurveyResponse[], page: string): string {
  const base = buildRAGContext(data);
  return `${base}\n\n=== CURRENT PAGE FOCUS ===\nYou are analyzing the "${page}" section of the dashboard. Tailor your insights specifically to this topic.`;
}
