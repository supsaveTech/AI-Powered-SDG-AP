export interface IndexMethodology {
  name: string;
  description: string;
  contributingIndicators: {
    label: string;
    weight: number;
    sourceQuestions: number[];
  }[];
  formula: string;
  scale: string;
}

export const INDEX_METHODOLOGIES: Record<string, IndexMethodology> = {
  aiReadiness: {
    name: "AI Readiness Index",
    description: "Measures the population's awareness, adoption, and usage frequency of AI tools.",
    contributingIndicators: [
      { label: "Has Used AI", weight: 40, sourceQuestions: [19] },
      { label: "AI Usage Frequency", weight: 30, sourceQuestions: [21] },
      { label: "Diversity of AI Tools Used", weight: 30, sourceQuestions: [20] }
    ],
    formula: "(Used_AI × 0.4) + (Freq_Score × 0.3) + (Tools_Score × 0.3)",
    scale: "0–100 (100 = Highly Ready)"
  },
  digitalAccess: {
    name: "Digital Access Index",
    description: "Measures the baseline infrastructure required to participate in the digital economy.",
    contributingIndicators: [
      { label: "Device Ownership (Laptop/Desktop/Smartphone/Tablet)", weight: 40, sourceQuestions: [6, 7, 8, 9] },
      { label: "Internet Reliability", weight: 30, sourceQuestions: [10] },
      { label: "Electricity Reliability", weight: 30, sourceQuestions: [12] }
    ],
    formula: "(Device_Score × 0.4) + (Internet_Score × 0.3) + (Electricity_Score × 0.3)",
    scale: "0–100 (100 = Full Access)"
  },
  digitalSkills: {
    name: "Digital Skills Readiness Score",
    description: "Evaluates self-reported proficiency across various digital competency areas.",
    contributingIndicators: [
      { label: "Self-Rated Overall Level", weight: 40, sourceQuestions: [17] },
      { label: "Coding/Programming Experience", weight: 20, sourceQuestions: [18] },
      { label: "Diversity of Specific Skills", weight: 40, sourceQuestions: [16] }
    ],
    formula: "(Overall_Level_Score × 0.4) + (Coding_Exp × 0.2) + (Skill_Count_Score × 0.4)",
    scale: "0–100 (100 = Advanced)"
  },
  careerAwareness: {
    name: "Career Awareness Score",
    description: "Measures the breadth of knowledge regarding modern technology career paths.",
    contributingIndicators: [
      { label: "Number of Tech Careers Known", weight: 60, sourceQuestions: [23] },
      { label: "Expressed Interest in Tech Career", weight: 40, sourceQuestions: [24] }
    ],
    formula: "(Careers_Known_Score × 0.6) + (Interest_Level_Score × 0.4)",
    scale: "0–100 (100 = Highly Aware)"
  },
  employmentReadiness: {
    name: "Employment Readiness Index",
    description: "Evaluates how aligned the individual's aspirations and perceived skills are with modern job markets.",
    contributingIndicators: [
      { label: "Desire for Modern Work Types (Remote/Hybrid)", weight: 50, sourceQuestions: [26] },
      { label: "Identification of High-Value Skills", weight: 50, sourceQuestions: [27] }
    ],
    formula: "(Work_Type_Score × 0.5) + (Desired_Skills_Score × 0.5)",
    scale: "0–100 (100 = Highly Ready)"
  },
  barrierSeverity: {
    name: "Barrier Severity Analysis",
    description: "Ranks the severity of obstacles preventing digital inclusion.",
    contributingIndicators: [
      { label: "Selection as a General Barrier", weight: 40, sourceQuestions: [28] },
      { label: "Selection as the Biggest Barrier", weight: 60, sourceQuestions: [29] }
    ],
    formula: "(General_Barrier_Freq × 0.4) + (Biggest_Barrier_Freq × 0.6)",
    scale: "0–5 (5 = Most Severe)"
  }
};
