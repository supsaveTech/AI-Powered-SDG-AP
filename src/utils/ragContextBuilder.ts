import { SurveyResponse } from "../types";
import { AnalyticsContextType } from "../contexts/DataContext";
import {
  calculateBarrierSeverity,
  getDemographics,
  getAIAwarenessMetrics,
  getInfrastructureMetrics,
} from "./dataAggregation";

/**
 * Builds a rich textual context summary from aggregated survey data.
 * Accepts pre-computed analytics from DataContext as SSOT to avoid redundant calculations.
 */
export function buildRAGContext(data: SurveyResponse[], analytics?: AnalyticsContextType | null): string {
  if (!data || data.length === 0) {
    return "No survey data is currently available.";
  }

  const total = data.length;
  const demographics = getDemographics(data);
  const barriers = calculateBarrierSeverity(data);
  const aiMetrics = getAIAwarenessMetrics(data);
  const infraMetrics = getInfrastructureMetrics(data);

  // Use SSOT analytics from DataContext if available, otherwise fall back to on-the-fly calculation
  const smartphonePct = analytics?.smartphonePct ?? Math.round((data.filter(d => d.ownsSmartphone).length / total) * 100);
  const laptopPct = analytics?.laptopPct ?? Math.round((data.filter(d => d.ownsLaptop).length / total) * 100);
  const tabletPct = analytics?.tabletPct ?? Math.round((data.filter(d => d.hasTabletAccess).length / total) * 100);
  const desktopPct = analytics?.desktopPct ?? Math.round((data.filter(d => d.hasDesktopAccess).length / total) * 100);
  const remoteWorkPct = analytics?.remoteWorkInterest ?? Math.round((data.filter(d => {
    const interest = String(d.interestInRemoteWork).toLowerCase();
    return interest.includes('agree') || interest.includes('strongly agree') || interest.includes('yes');
  }).length / total) * 100);
  const digitalSkillsScore = analytics?.digitalSkillsReadiness?.toFixed(1) ?? '0';
  const techInterestScore = analytics?.careerAwarenessScore?.toFixed(1) ?? '0';
  const employmentReadinessScore = analytics?.employmentReadinessIndex?.toFixed(1) ?? '0';
  const aiReadinessScore = analytics?.aiReadinessIndex?.toFixed(1) ?? '0';
  const accessScore = analytics?.digitalAccessIndex?.toFixed(1) ?? '0';
  const topBarrierName = analytics?.topBarrier ?? (barriers.length > 0 ? barriers[0].name : 'Unknown');
  const topPowerSource = analytics?.topPowerSource ?? infraMetrics.powerSource[0]?.name ?? 'Unknown';

  const topGender = demographics.gender[0];
  const topLocation = demographics.location[0];

  // Community distribution for narrative reports
  const communityDist = demographics.location
    .slice(0, 5)
    .map((l, i) => `${i + 1}. ${l.name}: ${Math.round((l.value / total) * 100)}%`)
    .join('\n');

  const notice = "Based on responses collected from youths in Port Harcourt...";

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
- Communities covered:
${communityDist}

=== DIGITAL ACCESS & INFRASTRUCTURE [Q6-Q15] ===
- Digital Access Index: ${accessScore}/100
- Smartphone ownership: ${smartphonePct}%
- Laptop ownership: ${laptopPct}%
- Tablet ownership: ${tabletPct}%
- Desktop ownership: ${desktopPct}%
- Top Power Source: ${topPowerSource} [Source: Q12]

=== DIGITAL SKILLS [Q16-Q18] ===
- Digital Skills Readiness Score: ${digitalSkillsScore}/100

=== AI AWARENESS [Q19-Q22] ===
- AI Readiness Index: ${aiReadinessScore}/100
- AI Adoption Rate (Has used AI): ${aiMetrics.aiAdoptionRate}% [Source: Q19]
- Top AI Tools: ${aiMetrics.topTools.map(t => t.name).join(', ')} [Source: Q20]

=== TECHNOLOGY CAREER AWARENESS [Q23-Q25] ===
- Technology Career Interest Score: ${techInterestScore}/100

=== EMPLOYMENT READINESS [Q26-Q27] ===
- Employment Readiness Index: ${employmentReadinessScore}/100
- Interest in remote work: ${remoteWorkPct}%

=== BARRIERS TO LEARNING [Q28-Q29] ===
Top Barrier: ${topBarrierName}
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
export function buildPageContext(data: SurveyResponse[], page: string, analytics?: AnalyticsContextType | null): string {
  const base = buildRAGContext(data, analytics);
  return `${base}\n\n=== CURRENT PAGE FOCUS ===\nYou are analyzing the "${page}" section of the dashboard. Tailor your insights specifically to this topic.`;
}
