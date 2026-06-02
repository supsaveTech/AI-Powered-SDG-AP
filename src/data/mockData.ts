import { SurveyResponse, Gender, EducationLevel, LikertScale } from '../types';

const generateRandomId = () => Math.random().toString(36).substring(2, 9);

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const genders: Gender[] = ['Male', 'Female', 'Male', 'Female', 'Prefer not to say'];
const educationLevels: EducationLevel[] = ['Secondary School', 'Undergraduate', 'Graduate', 'Other'];
const locations = ['Elelenwo', 'Rumuola', 'D-Line', 'GRA', 'Trans Amadi', 'Diobu', 'Woji'];
const internetReliabilityOptions: ('Poor' | 'Fair' | 'Good' | 'Excellent')[] = ['Poor', 'Fair', 'Fair', 'Good', 'Excellent'];
const likertOptions: LikertScale[] = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

export const generateMockData = (count: number = 300): SurveyResponse[] => {
  const data: SurveyResponse[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Generate dates over the past 30 days
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    // Slight correlation: older people might have more access to laptops
    const age = getRandomNumber(15, 35);
    const ownsLaptop = age > 20 ? Math.random() > 0.4 : Math.random() > 0.7;

    data.push({
      id: generateRandomId(),
      timestamp: date.toISOString(),
      
      age,
      gender: getRandomItem(genders),
      educationLevel: getRandomItem(educationLevels),
      location: getRandomItem(locations),
      
      ownsSmartphone: Math.random() > 0.1, // 90% have smartphones
      ownsLaptop,
      hasDesktopAccess: Math.random() > 0.8, // 20% desktop
      hasTabletAccess: Math.random() > 0.85,
      internetReliability: getRandomItem(internetReliabilityOptions),
      
      skillMicrosoftWord: getRandomNumber(1, 5),
      skillExcel: getRandomNumber(1, 4),
      skillProgramming: getRandomNumber(1, 3), // lower average
      skillGraphicDesign: getRandomNumber(1, 4),
      skillDigitalMarketing: getRandomNumber(1, 5),
      skillAITools: getRandomNumber(1, 3), // lower average
      skillDataAnalysis: getRandomNumber(1, 3),
      skillVideoEditing: getRandomNumber(1, 4),
      
      awareSoftwareEngineering: Math.random() > 0.4,
      awareDataScience: Math.random() > 0.6,
      awareAI: Math.random() > 0.3,
      awareCybersecurity: Math.random() > 0.5,
      awareUIUX: Math.random() > 0.4,
      awareCloudComputing: Math.random() > 0.7,
      awareDigitalMarketing: Math.random() > 0.2,
      
      interestInRemoteWork: getRandomItem(likertOptions),
      desiredSkills: ['Software Engineering', 'Data Science'].filter(() => Math.random() > 0.5),
      employmentAspirations: 'Tech Industry',
      
      barrierCost: getRandomNumber(3, 5), // Cost is a major barrier
      barrierDeviceAccess: ownsLaptop ? getRandomNumber(1, 3) : getRandomNumber(4, 5),
      barrierInternetAccess: getRandomNumber(2, 5),
      barrierMentorship: getRandomNumber(3, 5),
      barrierAwareness: getRandomNumber(2, 4),
      barrierTime: getRandomNumber(1, 4),
    });
  }

  // Sort by date ascending
  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Generate and export standard mock data set
export const mockSurveyData = generateMockData(350);
