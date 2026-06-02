import { SurveyResponse, LikertScale } from '../types';

export const calculateAverage = (arr: number[]) => {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
};

export const getLikertValue = (scale: LikertScale): number => {
  const mapping: Record<LikertScale, number> = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
  };
  return mapping[scale] || 3;
};

/**
 * Calculates the Digital Skills Readiness Score (0-100)
 */
export const calculateDigitalSkillsReadiness = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;
  
  const scores = data.map(response => {
    // Average of 8 skills (each 1-5)
    const avgSkill = (
      response.skillMicrosoftWord +
      response.skillExcel +
      response.skillProgramming +
      response.skillGraphicDesign +
      response.skillDigitalMarketing +
      response.skillAITools +
      response.skillDataAnalysis +
      response.skillVideoEditing
    ) / 8;
    
    // Convert 1-5 scale to 0-100 score: (value - 1) / 4 * 100
    return ((avgSkill - 1) / 4) * 100;
  });

  return calculateAverage(scores);
};

/**
 * Calculates the Technology Career Interest Score (0-100)
 */
export const calculateTechCareerInterest = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;

  const scores = data.map(response => {
    let awarenessCount = 0;
    if (response.awareSoftwareEngineering) awarenessCount++;
    if (response.awareDataScience) awarenessCount++;
    if (response.awareAI) awarenessCount++;
    if (response.awareCybersecurity) awarenessCount++;
    if (response.awareUIUX) awarenessCount++;
    if (response.awareCloudComputing) awarenessCount++;
    if (response.awareDigitalMarketing) awarenessCount++;

    // Max awareness is 7. Calculate percentage
    return (awarenessCount / 7) * 100;
  });

  return calculateAverage(scores);
};

/**
 * Calculates the Employment Readiness Index (0-100)
 */
export const calculateEmploymentReadiness = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;

  const scores = data.map(response => {
    const remoteWorkInterest = getLikertValue(response.interestInRemoteWork); // 1-5
    // Example formula: Combine remote work interest and having desired skills listed
    const baseScore = ((remoteWorkInterest - 1) / 4) * 60; // Up to 60 points for remote interest
    const skillsBonus = Math.min(response.desiredSkills.length * 10, 40); // Up to 40 points for identified skills
    
    return baseScore + skillsBonus;
  });

  return calculateAverage(scores);
};

/**
 * Generates the Barrier Severity Ranking
 */
export const generateBarrierRanking = (data: SurveyResponse[]): { name: string, score: number }[] => {
  if (data.length === 0) return [];

  const costScores = data.map(d => d.barrierCost);
  const deviceScores = data.map(d => d.barrierDeviceAccess);
  const internetScores = data.map(d => d.barrierInternetAccess);
  const mentorScores = data.map(d => d.barrierMentorship);
  const awarenessScores = data.map(d => d.barrierAwareness);
  const timeScores = data.map(d => d.barrierTime);

  const rankings = [
    { name: 'Cost', score: calculateAverage(costScores) },
    { name: 'Device Access', score: calculateAverage(deviceScores) },
    { name: 'Internet Access', score: calculateAverage(internetScores) },
    { name: 'Mentorship', score: calculateAverage(mentorScores) },
    { name: 'Awareness', score: calculateAverage(awarenessScores) },
    { name: 'Time', score: calculateAverage(timeScores) },
  ];

  return rankings.sort((a, b) => b.score - a.score);
};

/**
 * Get Demographic Aggregations
 */
export const getDemographics = (data: SurveyResponse[]) => {
  const genderDist = data.reduce((acc, curr) => {
    acc[curr.gender] = (acc[curr.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const educationDist = data.reduce((acc, curr) => {
    acc[curr.educationLevel] = (acc[curr.educationLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationDist = data.reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Age buckets
  const ageBuckets = {
    '15-18': 0,
    '19-22': 0,
    '23-26': 0,
    '27-30': 0,
    '31+': 0
  };

  data.forEach(d => {
    if (d.age <= 18) ageBuckets['15-18']++;
    else if (d.age <= 22) ageBuckets['19-22']++;
    else if (d.age <= 26) ageBuckets['23-26']++;
    else if (d.age <= 30) ageBuckets['27-30']++;
    else ageBuckets['31+']++;
  });

  return {
    gender: Object.entries(genderDist).map(([name, value]) => ({ name, value })),
    education: Object.entries(educationDist).map(([name, value]) => ({ name, value })),
    location: Object.entries(locationDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    age: Object.entries(ageBuckets).map(([name, value]) => ({ name, value }))
  };
};

/**
 * Gets access metrics
 */
export const getAccessMetrics = (data: SurveyResponse[]) => {
  const total = data.length || 1;
  
  const hasSmartphone = data.filter(d => d.ownsSmartphone).length;
  const hasLaptop = data.filter(d => d.ownsLaptop).length;
  const hasDesktop = data.filter(d => d.hasDesktopAccess).length;
  const hasTablet = data.filter(d => d.hasTabletAccess).length;

  const internetReliabilityDist = data.reduce((acc, curr) => {
    acc[curr.internetReliability] = (acc[curr.internetReliability] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    deviceAccess: [
      { name: 'Smartphone', percentage: Math.round((hasSmartphone / total) * 100) },
      { name: 'Laptop', percentage: Math.round((hasLaptop / total) * 100) },
      { name: 'Desktop', percentage: Math.round((hasDesktop / total) * 100) },
      { name: 'Tablet', percentage: Math.round((hasTablet / total) * 100) }
    ],
    internetReliability: Object.entries(internetReliabilityDist).map(([name, value]) => ({ name, value }))
  };
};
