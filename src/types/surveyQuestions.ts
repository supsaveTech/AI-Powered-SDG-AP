import { SurveyResponse } from './index';

export interface SurveyQuestionMeta {
  questionNumber: number;
  questionText: string;
  fieldKey: keyof SurveyResponse;
  category: 'demographics' | 'digital-access' | 'digital-skills' | 'ai-awareness' | 'career' | 'employment' | 'barriers' | 'qualitative';
}

export const SURVEY_QUESTIONS: SurveyQuestionMeta[] = [
  // Demographics
  { questionNumber: 3, questionText: "Age Group", fieldKey: 'ageGroup', category: 'demographics' },
  { questionNumber: 4, questionText: "Gender", fieldKey: 'gender', category: 'demographics' },
  { questionNumber: 5, questionText: "Which area/community do you currently reside in?", fieldKey: 'location', category: 'demographics' },
  { questionNumber: 6, questionText: "Highest Level of Education Completed", fieldKey: 'educationLevel', category: 'demographics' },
  { questionNumber: 7, questionText: "Current Status", fieldKey: 'currentStatus', category: 'demographics' },

  // Digital Access
  // Note: Question 8 covers smartphone, laptop, desktop, and tablet. We map it generically to 'ownsSmartphone' as the primary indicator for now, 
  // but the parser handles the array split into multiple boolean fields.
  { questionNumber: 8, questionText: "Which devices do you have regular access to?", fieldKey: 'ownsSmartphone', category: 'digital-access' },
  { questionNumber: 9, questionText: "How reliable is your internet access?", fieldKey: 'internetReliability', category: 'digital-access' },
  { questionNumber: 10, questionText: "Where do you mostly access the internet?", fieldKey: 'internetAccessLocation', category: 'digital-access' },
  { questionNumber: 11, questionText: "How reliable is electricity in your area?", fieldKey: 'electricityReliability', category: 'digital-access' },
  { questionNumber: 12, questionText: "How do you primarily power your digital devices?", fieldKey: 'powerSource', category: 'digital-access' },
  { questionNumber: 13, questionText: "How often does unreliable electricity affect your ability to learn, work, or access digital services?", fieldKey: 'electricityImpact', category: 'digital-access' },
  { questionNumber: 14, questionText: "How much do you spend monthly on internet/data access?", fieldKey: 'monthlyDataCost', category: 'digital-access' },

  // Digital Skills
  { questionNumber: 15, questionText: "Which of the following digital skills do you possess?", fieldKey: 'digitalSkillsPossessed', category: 'digital-skills' },
  { questionNumber: 16, questionText: "How would you rate your overall digital skill level?", fieldKey: 'skillLevel', category: 'digital-skills' },
  { questionNumber: 17, questionText: "Have you ever written computer code/programs?", fieldKey: 'codingExperience', category: 'digital-skills' },

  // AI Awareness
  { questionNumber: 18, questionText: "Have you used an AI tool before?", fieldKey: 'hasUsedAI', category: 'ai-awareness' },
  { questionNumber: 19, questionText: "Which AI tools have you used?", fieldKey: 'aiToolsUsed', category: 'ai-awareness' },
  { questionNumber: 20, questionText: "How often do you use AI tools?", fieldKey: 'aiUsageFrequency', category: 'ai-awareness' },
  { questionNumber: 21, questionText: "What do you primarily use AI tools for?", fieldKey: 'aiUseCases', category: 'ai-awareness' },

  // Career Awareness
  { questionNumber: 22, questionText: "Which of the following technology careers are you familiar with?", fieldKey: 'techCareersKnown', category: 'career' },
  { questionNumber: 23, questionText: "Would you consider a career in technology?", fieldKey: 'careerInterest', category: 'career' },
  { questionNumber: 24, questionText: "Which technology field interests you the most?", fieldKey: 'preferredTechField', category: 'career' },

  // Employment Readiness
  { questionNumber: 25, questionText: "What type of work are you most interested in?", fieldKey: 'preferredWorkType', category: 'employment' },
  { questionNumber: 26, questionText: "Which digital skills would you most like to learn?", fieldKey: 'desiredSkills', category: 'employment' },

  // Barriers
  { questionNumber: 27, questionText: "What prevents you from learning digital skills?", fieldKey: 'barriersToLearning', category: 'barriers' },
  { questionNumber: 28, questionText: "Which of these is your biggest barrier?", fieldKey: 'biggestBarrier', category: 'barriers' },

  // Qualitative
  { questionNumber: 29, questionText: "What support would help you improve your digital skills and career opportunities?", fieldKey: 'supportNeeded', category: 'qualitative' },
  { questionNumber: 30, questionText: "In your opinion, what should be done to improve digital readiness among youths in Port Harcourt?", fieldKey: 'recommendations', category: 'qualitative' }
];
