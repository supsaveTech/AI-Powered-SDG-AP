export type Gender = 'Male' | 'Female' | 'Prefer not to say';
export type EducationLevel = 'Secondary School' | 'Undergraduate' | 'Graduate' | 'Other';
export type LikertScale = 'Strongly Disagree' | 'Disagree' | 'Neutral' | 'Agree' | 'Strongly Agree';

export interface SurveyResponse {
  id: string;
  timestamp: string;
  
  // Demographics
  age: number;
  gender: Gender;
  educationLevel: EducationLevel;
  location: string;
  
  // Digital Access
  ownsSmartphone: boolean;
  ownsLaptop: boolean;
  hasDesktopAccess: boolean;
  hasTabletAccess: boolean;
  internetReliability: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  
  // Digital Skills (Self-rated 1-5)
  skillMicrosoftWord: number;
  skillExcel: number;
  skillProgramming: number;
  skillGraphicDesign: number;
  skillDigitalMarketing: number;
  skillAITools: number;
  skillDataAnalysis: number;
  skillVideoEditing: number;
  
  // Career Awareness (Boolean: Aware or Not)
  awareSoftwareEngineering: boolean;
  awareDataScience: boolean;
  awareAI: boolean;
  awareCybersecurity: boolean;
  awareUIUX: boolean;
  awareCloudComputing: boolean;
  awareDigitalMarketing: boolean;
  
  // Employment Readiness
  interestInRemoteWork: LikertScale;
  desiredSkills: string[];
  employmentAspirations: string;
  
  // Barriers (Rated severity 1-5, 5 being most severe)
  barrierCost: number;
  barrierDeviceAccess: number;
  barrierInternetAccess: number;
  barrierMentorship: number;
  barrierAwareness: number;
  barrierTime: number;
}
