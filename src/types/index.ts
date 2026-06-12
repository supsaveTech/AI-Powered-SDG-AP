export type Gender = 'Male' | 'Female' | 'Prefer not to say' | string;
export type EducationLevel = 'Secondary School' | 'Undergraduate' | 'Graduate' | 'Other' | string;
export type LikertScale = 'Strongly Disagree' | 'Disagree' | 'Neutral' | 'Agree' | 'Strongly Agree';

export interface SurveyResponse {
  id: string;
  timestamp: string;
  
  // Demographics
  ageGroup: string; // Age Group
  age: number; // Keep for backward compat
  gender: string;
  educationLevel: string;
  location: string; // Community
  currentStatus: string;
  
  // Digital Access
  ownsSmartphone: boolean;
  ownsLaptop: boolean;
  hasDesktopAccess: boolean;
  hasTabletAccess: boolean;
  internetReliability: string;
  internetAccessLocation: string;
  electricityReliability: string;
  powerSource: string;
  electricityImpact: string;
  monthlyDataCost: string;
  
  // Digital Skills
  digitalSkillsPossessed: string[];
  skillLevel: string;
  codingExperience: string;
  
  // Keeping these for numerical index calculation if we still generate them, 
  // or we can map them from digitalSkillsPossessed. I'll keep them for backward compatibility
  // with existing aggregation logic, assuming the new parser will populate them.
  skillMicrosoftWord: number;
  skillExcel: number;
  skillProgramming: number;
  skillGraphicDesign: number;
  skillDigitalMarketing: number;
  skillAITools: number;
  skillDataAnalysis: number;
  skillVideoEditing: number;
  
  // AI Awareness
  hasUsedAI: boolean;
  aiToolsUsed: string[];
  aiUsageFrequency: string;
  aiUseCases: string[];
  
  // Career Awareness
  techCareersKnown: string[];
  careerInterest: string;
  preferredTechField: string;
  
  // Keeping boolean fields for aggregation
  awareSoftwareEngineering: boolean;
  awareDataScience: boolean;
  awareAI: boolean;
  awareCybersecurity: boolean;
  awareUIUX: boolean;
  awareCloudComputing: boolean;
  awareDigitalMarketing: boolean;

  // Employment Readiness
  preferredWorkType: string;
  interestInRemoteWork: LikertScale | string; // Keep for compat
  desiredSkills: string[];
  employmentAspirations: string; // Keep for compat
  
  // Barriers
  barriersToLearning: string[];
  biggestBarrier: string;
  
  // Keeping numeric barriers for severity ranking
  barrierCost: number;
  barrierDeviceAccess: number;
  barrierInternetAccess: number;
  barrierMentorship: number;
  barrierAwareness: number;
  barrierTime: number;

  // Qualitative
  supportNeeded: string;
  recommendations: string;
}
