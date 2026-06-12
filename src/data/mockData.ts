import { SurveyResponse } from '../types';

const generateRandomId = () => Math.random().toString(36).substring(2, 9);
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const genders = ['Male', 'Female', 'Male', 'Female', 'Prefer not to say'];
const educationLevels = ['Secondary School', 'Undergraduate', 'Graduate', 'Other'];
const locations = ['Elelenwo', 'Rumuola', 'D-Line', 'GRA', 'Trans Amadi', 'Diobu', 'Woji'];
const currentStatuses = ['Student', 'Employed', 'Unemployed', 'Self-Employed', 'Freelancer'];
const internetReliabilityOptions = ['Poor', 'Fair', 'Good', 'Excellent'];
const internetLocations = ['Home', 'School', 'Cybercafe', 'Work', 'Mobile Data'];
const elecReliabilityOptions = ['Poor', 'Fair', 'Good', 'Excellent'];
const powerSources = ['NEPA/Grid', 'Generator', 'Solar', 'Inverter'];
const elecImpacts = ['Daily', 'Weekly', 'Rarely', 'Never'];
const dataCosts = ['< 1000 NGN', '1000-5000 NGN', '5000-10000 NGN', '> 10000 NGN'];

const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
const allSkills = ['Microsoft Word', 'Excel', 'Programming', 'Graphic Design', 'Digital Marketing', 'Data Analysis', 'Video Editing', 'AI Tools'];

const aiTools = ['ChatGPT', 'Gemini', 'Claude', 'Copilot', 'DeepSeek', 'Perplexity'];
const aiFreqs = ['Daily', 'Weekly', 'Monthly', 'Rarely'];
const aiUseCases = ['Writing', 'Coding', 'Research', 'Design', 'Data Analysis'];

const techCareers = ['Software Engineering', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'UI/UX Design', 'Cloud Computing', 'Digital Marketing'];
const careerInterests = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const workTypes = ['Remote Work', 'Hybrid Work', 'In-Office', 'Entrepreneurship', 'Freelancing'];
const allDesiredSkills = ['Coding', 'Communication', 'Leadership', 'Problem Solving', 'Data Analysis'];

const allBarriers = ['Cost of Data', 'Lack of Device', 'Poor Electricity', 'No Mentorship', 'Time Constraints', 'Lack of Awareness'];

export const generateMockData = (count: number = 300): SurveyResponse[] => {
  const data: SurveyResponse[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const age = getRandomNumber(15, 35);
    const ownsLaptop = age > 20 ? Math.random() > 0.4 : Math.random() > 0.7;
    const hasUsedAI = Math.random() > 0.4;
    const skills = getRandomItems(allSkills, getRandomNumber(1, 4));
    const careersKnown = getRandomItems(techCareers, getRandomNumber(1, 5));
    const barriers = getRandomItems(allBarriers, getRandomNumber(1, 3));

    data.push({
      id: generateRandomId(),
      timestamp: date.toISOString(),
      
      ageGroup: age < 18 ? 'Under 18' : age <= 24 ? '18-24' : age <= 30 ? '25-30' : '31+',
      age,
      gender: getRandomItem(genders),
      educationLevel: getRandomItem(educationLevels),
      location: getRandomItem(locations),
      currentStatus: getRandomItem(currentStatuses),
      
      ownsSmartphone: Math.random() > 0.1, 
      ownsLaptop,
      hasDesktopAccess: Math.random() > 0.8,
      hasTabletAccess: Math.random() > 0.85,
      internetReliability: getRandomItem(internetReliabilityOptions),
      internetAccessLocation: getRandomItem(internetLocations),
      electricityReliability: getRandomItem(elecReliabilityOptions),
      powerSource: getRandomItem(powerSources),
      electricityImpact: getRandomItem(elecImpacts),
      monthlyDataCost: getRandomItem(dataCosts),
      
      digitalSkillsPossessed: skills,
      skillLevel: getRandomItem(skillLevels),
      codingExperience: Math.random() > 0.7 ? 'Yes' : 'No',
      
      skillMicrosoftWord: skills.includes('Microsoft Word') ? getRandomNumber(2, 5) : 0,
      skillExcel: skills.includes('Excel') ? getRandomNumber(2, 5) : 0,
      skillProgramming: skills.includes('Programming') ? getRandomNumber(2, 5) : 0,
      skillGraphicDesign: skills.includes('Graphic Design') ? getRandomNumber(2, 5) : 0,
      skillDigitalMarketing: skills.includes('Digital Marketing') ? getRandomNumber(2, 5) : 0,
      skillAITools: skills.includes('AI Tools') ? getRandomNumber(2, 5) : 0,
      skillDataAnalysis: skills.includes('Data Analysis') ? getRandomNumber(2, 5) : 0,
      skillVideoEditing: skills.includes('Video Editing') ? getRandomNumber(2, 5) : 0,
      
      hasUsedAI,
      aiToolsUsed: hasUsedAI ? getRandomItems(aiTools, getRandomNumber(1, 3)) : [],
      aiUsageFrequency: hasUsedAI ? getRandomItem(aiFreqs) : '',
      aiUseCases: hasUsedAI ? getRandomItems(aiUseCases, getRandomNumber(1, 3)) : [],
      
      techCareersKnown: careersKnown,
      careerInterest: getRandomItem(careerInterests),
      preferredTechField: getRandomItem(techCareers),
      
      awareSoftwareEngineering: careersKnown.includes('Software Engineering'),
      awareDataScience: careersKnown.includes('Data Science'),
      awareAI: careersKnown.includes('Artificial Intelligence'),
      awareCybersecurity: careersKnown.includes('Cybersecurity'),
      awareUIUX: careersKnown.includes('UI/UX Design'),
      awareCloudComputing: careersKnown.includes('Cloud Computing'),
      awareDigitalMarketing: careersKnown.includes('Digital Marketing'),
      
      preferredWorkType: getRandomItem(workTypes),
      interestInRemoteWork: getRandomItem(careerInterests),
      desiredSkills: getRandomItems(allDesiredSkills, getRandomNumber(1, 3)),
      employmentAspirations: getRandomItem(techCareers),
      
      barriersToLearning: barriers,
      biggestBarrier: getRandomItem(barriers),
      
      barrierCost: barriers.includes('Cost of Data') ? 5 : 2,
      barrierDeviceAccess: barriers.includes('Lack of Device') ? 5 : 2,
      barrierInternetAccess: barriers.includes('Poor Electricity') ? 5 : 2,
      barrierMentorship: barriers.includes('No Mentorship') ? 5 : 2,
      barrierAwareness: barriers.includes('Lack of Awareness') ? 5 : 2,
      barrierTime: barriers.includes('Time Constraints') ? 5 : 2,

      supportNeeded: 'More training and laptops',
      recommendations: 'Provide free wifi in communities'
    });
  }

  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const mockSurveyData = generateMockData(350);
