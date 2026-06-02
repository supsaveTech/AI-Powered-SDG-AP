import { SurveyResponse } from "../types";
import {
  calculateAverage,
  calculateDigitalSkillsReadiness,
  calculateTechCareerInterest,
  calculateEmploymentReadiness,
  generateBarrierRanking,
  getDemographics,
  getAccessMetrics,
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
  const access = getAccessMetrics(data);
  const barriers = generateBarrierRanking(data);

  const digitalSkillsScore = calculateDigitalSkillsReadiness(data).toFixed(1);
  const techInterestScore = calculateTechCareerInterest(data).toFixed(1);
  const employmentReadinessScore = calculateEmploymentReadiness(data).toFixed(1);

  // --- Device Access ---
  const smartphonePct = access.deviceAccess.find(d => d.name === "Smartphone")?.percentage ?? 0;
  const laptopPct = access.deviceAccess.find(d => d.name === "Laptop")?.percentage ?? 0;
  const desktopPct = access.deviceAccess.find(d => d.name === "Desktop")?.percentage ?? 0;
  const tabletPct = access.deviceAccess.find(d => d.name === "Tablet")?.percentage ?? 0;

  // --- Internet ---
  const goodInternet = data.filter(d => d.internetReliability === "Good" || d.internetReliability === "Excellent").length;
  const goodInternetPct = Math.round((goodInternet / total) * 100);

  // --- Digital Skills ---
  const avgSkills = {
    "Microsoft Word": calculateAverage(data.map(d => d.skillMicrosoftWord)).toFixed(2),
    Excel: calculateAverage(data.map(d => d.skillExcel)).toFixed(2),
    Programming: calculateAverage(data.map(d => d.skillProgramming)).toFixed(2),
    "Graphic Design": calculateAverage(data.map(d => d.skillGraphicDesign)).toFixed(2),
    "Digital Marketing": calculateAverage(data.map(d => d.skillDigitalMarketing)).toFixed(2),
    "AI Tools": calculateAverage(data.map(d => d.skillAITools)).toFixed(2),
    "Data Analysis": calculateAverage(data.map(d => d.skillDataAnalysis)).toFixed(2),
    "Video Editing": calculateAverage(data.map(d => d.skillVideoEditing)).toFixed(2),
  };

  // --- Career Awareness ---
  const careerAwareness = {
    "Software Engineering": Math.round((data.filter(d => d.awareSoftwareEngineering).length / total) * 100),
    "Data Science": Math.round((data.filter(d => d.awareDataScience).length / total) * 100),
    "Artificial Intelligence": Math.round((data.filter(d => d.awareAI).length / total) * 100),
    Cybersecurity: Math.round((data.filter(d => d.awareCybersecurity).length / total) * 100),
    "UI/UX Design": Math.round((data.filter(d => d.awareUIUX).length / total) * 100),
    "Cloud Computing": Math.round((data.filter(d => d.awareCloudComputing).length / total) * 100),
    "Digital Marketing": Math.round((data.filter(d => d.awareDigitalMarketing).length / total) * 100),
  };

  // --- Employment ---
  const remoteInterest = data.filter(d =>
    d.interestInRemoteWork === "Agree" || d.interestInRemoteWork === "Strongly Agree"
  ).length;
  const remoteInterestPct = Math.round((remoteInterest / total) * 100);

  // --- Gender ---
  const topGender = demographics.gender.sort((a, b) => b.value - a.value)[0];
  const topLocation = demographics.location[0];
  const topEducation = demographics.education.sort((a, b) => b.value - a.value)[0];

  // --- Build context string ---
  const context = `
=== SURVEY DATASET CONTEXT ===
Project: Digital Skills for Decent Work
Location: Port Harcourt, Rivers State, Nigeria
SDGs: SDG 8 (Decent Work and Economic Growth), SDG 9 (Industry, Innovation and Infrastructure)
Total Survey Respondents: ${total}

=== DEMOGRAPHICS ===
- Predominant gender: ${topGender?.name} (${Math.round((topGender?.value / total) * 100)}%)
- Most common education level: ${topEducation?.name} (${Math.round((topEducation?.value / total) * 100)}%)
- Top location: ${topLocation?.name} (${Math.round((topLocation?.value / total) * 100)}% of respondents)
- Age groups (approx): ${demographics.age.map(a => `${a.name}: ${a.value}`).join(", ")}

=== DIGITAL ACCESS ===
- Smartphone ownership: ${smartphonePct}%
- Laptop ownership: ${laptopPct}%
- Desktop access: ${desktopPct}%
- Tablet access: ${tabletPct}%
- Respondents with Good/Excellent internet: ${goodInternetPct}%

=== DIGITAL SKILLS (Average proficiency, scale 1-5) ===
${Object.entries(avgSkills).map(([k, v]) => `- ${k}: ${v}/5`).join("\n")}
- Overall Digital Skills Readiness Score: ${digitalSkillsScore}/100

=== TECHNOLOGY CAREER AWARENESS (% of respondents aware) ===
${Object.entries(careerAwareness).map(([k, v]) => `- ${k}: ${v}%`).join("\n")}
- Technology Career Interest Score: ${techInterestScore}/100

=== EMPLOYMENT READINESS ===
- Interest in remote work (Agree/Strongly Agree): ${remoteInterestPct}%
- Employment Readiness Index: ${employmentReadinessScore}/100

=== BARRIERS TO LEARNING DIGITAL SKILLS (Ranked by severity, 1-5 scale) ===
${barriers.map((b, i) => `${i + 1}. ${b.name}: ${b.score.toFixed(2)}/5`).join("\n")}

=== SCHOOL OBSERVATION (Lift Up Child Education Centre, Elelenwo) ===
- Students who have ever used a computer: 30%
- Students aware of AI tools: 20%
- Students who understand programming: 10%
- Students who considered Software Engineering as a career: 0%

=== KEY SDG ALIGNMENT ===
- SDG 8 (Decent Work): Remote work interest (${remoteInterestPct}%), employment readiness (${employmentReadinessScore}/100), digital skill gaps in high-demand areas.
- SDG 9 (Innovation): Low AI/programming awareness and access gaps limiting innovation participation.
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
