import { SurveyResponse } from './index';

export interface SurveyQuestionMeta {
  questionNumber: number;
  questionText: string;
  fieldKey: keyof SurveyResponse;
  category: 'demographics' | 'digital-access' | 'digital-skills' | 'ai-awareness' | 'career' | 'employment' | 'barriers' | 'qualitative';
}

export const SURVEY_QUESTIONS: SurveyQuestionMeta[] = [
  // Demographics
  { questionNumber: 1, questionText: "What is your age?", fieldKey: 'age', category: 'demographics' },
  { questionNumber: 2, questionText: "What is your gender?", fieldKey: 'gender', category: 'demographics' },
  { questionNumber: 3, questionText: "Which community do you live in?", fieldKey: 'location', category: 'demographics' },
  { questionNumber: 4, questionText: "What is your highest level of education?", fieldKey: 'educationLevel', category: 'demographics' },
  { questionNumber: 5, questionText: "What is your current status?", fieldKey: 'currentStatus', category: 'demographics' },

  // Digital Access
  { questionNumber: 6, questionText: "Do you own a smartphone?", fieldKey: 'ownsSmartphone', category: 'digital-access' },
  { questionNumber: 7, questionText: "Do you own a laptop?", fieldKey: 'ownsLaptop', category: 'digital-access' },
  { questionNumber: 8, questionText: "Do you have access to a desktop computer?", fieldKey: 'hasDesktopAccess', category: 'digital-access' },
  { questionNumber: 9, questionText: "Do you have access to a tablet?", fieldKey: 'hasTabletAccess', category: 'digital-access' },
  { questionNumber: 10, questionText: "How reliable is the internet connection in your area?", fieldKey: 'internetReliability', category: 'digital-access' },
  { questionNumber: 11, questionText: "Where do you most often access the internet?", fieldKey: 'internetAccessLocation', category: 'digital-access' },
  { questionNumber: 12, questionText: "How reliable is electricity in your area?", fieldKey: 'electricityReliability', category: 'digital-access' },
  { questionNumber: 13, questionText: "What is your primary source of power?", fieldKey: 'powerSource', category: 'digital-access' },
  { questionNumber: 14, questionText: "How often does lack of electricity impact your ability to use digital devices?", fieldKey: 'electricityImpact', category: 'digital-access' },
  { questionNumber: 15, questionText: "How much do you spend on internet data monthly?", fieldKey: 'monthlyDataCost', category: 'digital-access' },

  // Digital Skills
  { questionNumber: 16, questionText: "Which digital skills do you possess?", fieldKey: 'digitalSkillsPossessed', category: 'digital-skills' },
  { questionNumber: 17, questionText: "How would you rate your overall digital skill level?", fieldKey: 'skillLevel', category: 'digital-skills' },
  { questionNumber: 18, questionText: "Do you have any programming or coding experience?", fieldKey: 'codingExperience', category: 'digital-skills' },

  // AI Awareness
  { questionNumber: 19, questionText: "Have you used an AI tool before?", fieldKey: 'hasUsedAI', category: 'ai-awareness' },
  { questionNumber: 20, questionText: "Which AI tools have you used?", fieldKey: 'aiToolsUsed', category: 'ai-awareness' },
  { questionNumber: 21, questionText: "How often do you use AI tools?", fieldKey: 'aiUsageFrequency', category: 'ai-awareness' },
  { questionNumber: 22, questionText: "What do you primarily use AI for?", fieldKey: 'aiUseCases', category: 'ai-awareness' },

  // Career Awareness
  { questionNumber: 23, questionText: "Which technology careers are you aware of?", fieldKey: 'techCareersKnown', category: 'career' },
  { questionNumber: 24, questionText: "Would you consider a career in technology?", fieldKey: 'careerInterest', category: 'career' },
  { questionNumber: 25, questionText: "What is your preferred technology field?", fieldKey: 'preferredTechField', category: 'career' },

  // Employment Readiness
  { questionNumber: 26, questionText: "What is your preferred work arrangement?", fieldKey: 'preferredWorkType', category: 'employment' },
  { questionNumber: 27, questionText: "Which skills do you think are most important for employment?", fieldKey: 'desiredSkills', category: 'employment' },

  // Barriers
  { questionNumber: 28, questionText: "What barriers prevent you from learning digital skills?", fieldKey: 'barriersToLearning', category: 'barriers' },
  { questionNumber: 29, questionText: "What is your biggest barrier to digital inclusion?", fieldKey: 'biggestBarrier', category: 'barriers' },

  // Qualitative
  { questionNumber: 30, questionText: "What kind of support do you need most?", fieldKey: 'supportNeeded', category: 'qualitative' },
  { questionNumber: 31, questionText: "Any recommendations for improving digital literacy in your community?", fieldKey: 'recommendations', category: 'qualitative' }
];
