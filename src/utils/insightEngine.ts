import { SurveyResponse } from "../types";
import { 
  calculateDigitalSkillsReadiness, 
  calculateCareerAwarenessScore, 
  calculateBarrierSeverity 
} from "./dataAggregation";

export const generateInsights = (data: SurveyResponse[]) => {
  const insights: string[] = [];
  
  if (data.length === 0) return insights;

  // Insight 1: Device ownership comparison
  const total = data.length;
  const smartphone = data.filter(d => d.ownsSmartphone).length / total;
  const laptop = data.filter(d => d.ownsLaptop).length / total;
  
  if (smartphone - laptop > 0.3) {
    insights.push(`Smartphone ownership (${Math.round(smartphone*100)}%) is significantly higher than laptop ownership (${Math.round(laptop*100)}%), indicating a mobile-first reality for this demographic.`);
  }

  // Insight 2: Career Interest vs Awareness
  const techInterest = calculateCareerAwarenessScore(data);
  const digitalSkills = calculateDigitalSkillsReadiness(data);
  
  if (techInterest > digitalSkills + 10) {
    insights.push(`Interest in technology careers (${Math.round(techInterest)}%) exceeds current digital skill readiness (${Math.round(digitalSkills)}%), showing a strong appetite for learning despite existing knowledge gaps.`);
  }

  // Insight 3: Top Barrier
  const barriers = calculateBarrierSeverity(data);
  if (barriers.length > 0) {
    const topBarrier = barriers[0];
    if (topBarrier.score > 3.5) {
      insights.push(`${topBarrier.name} remains the most significant barrier to learning digital skills, with a critical severity score of ${topBarrier.score.toFixed(1)} out of 5.`);
    }
  }

  return insights;
};
