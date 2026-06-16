import { SurveyResponse, LikertScale } from '../types';

export const calculateAverage = (arr: number[]) => {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
};

export const getLikertValue = (scale: LikertScale | string): number => {
  const mapping: Record<string, number> = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
  };
  return mapping[scale] || 3;
};

/**
 * AI Readiness Index (0-100)
 */
export const calculateAIReadinessIndex = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;
  
  const scores = data.map(response => {
    const usedAI = response.hasUsedAI ? 100 : 0;
    
    let freqScore = 0;
    const freq = response.aiUsageFrequency?.toLowerCase() || '';
    if (freq.includes('daily')) freqScore = 100;
    else if (freq.includes('weekly')) freqScore = 75;
    else if (freq.includes('monthly')) freqScore = 50;
    else if (freq.includes('rarely')) freqScore = 25;

    const toolsScore = Math.min((response.aiToolsUsed?.length || 0) * 20, 100);

    return (usedAI * 0.4) + (freqScore * 0.3) + (toolsScore * 0.3);
  });

  return calculateAverage(scores);
};

/**
 * Digital Access Index (0-100)
 */
export const calculateDigitalAccessIndex = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;
  
  const scores = data.map(response => {
    let deviceCount = 0;
    if (response.ownsSmartphone) deviceCount++;
    if (response.ownsLaptop) deviceCount++;
    if (response.hasDesktopAccess) deviceCount++;
    if (response.hasTabletAccess) deviceCount++;
    const deviceScore = Math.min((deviceCount / 2) * 100, 100);

    let internetScore = 50;
    const intRel = response.internetReliability?.toLowerCase() || '';
    if (intRel.includes('excellent')) internetScore = 100;
    else if (intRel.includes('good')) internetScore = 75;
    else if (intRel.includes('fair')) internetScore = 50;
    else if (intRel.includes('poor')) internetScore = 25;

    let elecScore = 50;
    const elecRel = response.electricityReliability?.toLowerCase() || '';
    if (elecRel.includes('excellent') || elecRel.includes('always')) elecScore = 100;
    else if (elecRel.includes('good') || elecRel.includes('mostly')) elecScore = 75;
    else if (elecRel.includes('fair') || elecRel.includes('sometimes')) elecScore = 50;
    else if (elecRel.includes('poor') || elecRel.includes('rarely')) elecScore = 25;

    return (deviceScore * 0.4) + (internetScore * 0.3) + (elecScore * 0.3);
  });

  return calculateAverage(scores);
};

/**
 * Digital Skills Readiness Score (0-100)
 */
export const calculateDigitalSkillsReadiness = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;
  
  const scores = data.map(response => {
    let overallLevelScore = 50;
    const level = response.skillLevel?.toLowerCase() || '';
    if (level.includes('advanced') || level.includes('expert')) overallLevelScore = 100;
    else if (level.includes('intermediate')) overallLevelScore = 75;
    else if (level.includes('beginner')) overallLevelScore = 50;
    else if (level.includes('none')) overallLevelScore = 0;

    let codingExpScore = 0;
    const codingExp = response.codingExperience?.toLowerCase() || '';
    if (codingExp.includes('yes') || codingExp.includes('some')) codingExpScore = 100;

    const skillCountScore = Math.min((response.digitalSkillsPossessed?.length || 0) * 15, 100);

    return (overallLevelScore * 0.4) + (codingExpScore * 0.2) + (skillCountScore * 0.4);
  });

  return calculateAverage(scores);
};

/**
 * Career Awareness Score (0-100)
 */
export const calculateCareerAwarenessScore = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;

  const scores = data.map(response => {
    const careersKnownScore = Math.min((response.techCareersKnown?.length || 0) * 15, 100);
    
    let interestLevelScore = 50;
    const interest = String(response.careerInterest).toLowerCase();
    if (interest.includes('strongly agree') || interest.includes('very interested') || interest.includes('yes')) interestLevelScore = 100;
    else if (interest.includes('agree') || interest.includes('interested')) interestLevelScore = 75;
    else if (interest.includes('neutral') || interest.includes('maybe')) interestLevelScore = 50;
    else if (interest.includes('disagree') || interest.includes('no')) interestLevelScore = 25;
    else if (interest.includes('strongly disagree')) interestLevelScore = 0;

    return (careersKnownScore * 0.6) + (interestLevelScore * 0.4);
  });

  return calculateAverage(scores);
};

/**
 * Employment Readiness Index (0-100)
 */
export const calculateEmploymentReadiness = (data: SurveyResponse[]): number => {
  if (data.length === 0) return 0;

  const scores = data.map(response => {
    let workTypeScore = 50;
    const workType = response.preferredWorkType?.toLowerCase() || '';
    if (workType.includes('remote') || workType.includes('hybrid')) workTypeScore = 100;
    else if (workType.includes('entrepreneur') || workType.includes('freelance')) workTypeScore = 80;

    const desiredSkillsScore = Math.min((response.desiredSkills?.length || 0) * 20, 100);
    
    return (workTypeScore * 0.5) + (desiredSkillsScore * 0.5);
  });

  return calculateAverage(scores);
};

/**
 * Barrier Severity Analysis
 */
export const calculateBarrierSeverity = (data: SurveyResponse[]): { name: string, score: number }[] => {
  if (data.length === 0) return [];

  const barrierCounts: Record<string, number> = {};
  const biggestBarrierCounts: Record<string, number> = {};

  data.forEach(d => {
    (d.barriersToLearning || []).forEach(b => {
      barrierCounts[b] = (barrierCounts[b] || 0) + 1;
    });
    if (d.biggestBarrier) {
      biggestBarrierCounts[d.biggestBarrier] = (biggestBarrierCounts[d.biggestBarrier] || 0) + 1;
    }
  });

  const allBarriers = Array.from(new Set([...Object.keys(barrierCounts), ...Object.keys(biggestBarrierCounts)]));

  const rankings = allBarriers.map(b => {
    const generalFreq = (barrierCounts[b] || 0) / data.length; // 0 to 1
    const biggestFreq = (biggestBarrierCounts[b] || 0) / data.length; // 0 to 1
    
    // Formula: (General_Barrier_Freq * 0.4) + (Biggest_Barrier_Freq * 0.6)
    // Scale to 0-5
    const score = ((generalFreq * 0.4) + (biggestFreq * 0.6)) * 5;
    
    return { name: b, score };
  });

  return rankings.sort((a, b) => b.score - a.score);
};

/**
 * AI Awareness Metrics
 */
export const getAIAwarenessMetrics = (data: SurveyResponse[]) => {
  const total = data.length || 1;
  const aiAdoptionRate = Math.round((data.filter(d => d.hasUsedAI).length / total) * 100);
  
  const toolsCount = data.reduce((acc, curr) => {
    (curr.aiToolsUsed || []).forEach(t => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  const freqCount = data.reduce((acc, curr) => {
    if (curr.aiUsageFrequency) acc[curr.aiUsageFrequency] = (acc[curr.aiUsageFrequency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const useCasesCount = data.reduce((acc, curr) => {
    (curr.aiUseCases || []).forEach(u => { acc[u] = (acc[u] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  return {
    aiAdoptionRate,
    topTools: Object.entries(toolsCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    usageFrequency: Object.entries(freqCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    topUseCases: Object.entries(useCasesCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
  };
};

/**
 * Infrastructure Metrics
 */
export const getInfrastructureMetrics = (data: SurveyResponse[]) => {
  const elecDist = data.reduce((acc, curr) => {
    if (curr.electricityReliability) acc[curr.electricityReliability] = (acc[curr.electricityReliability] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const powerSourceDist = data.reduce((acc, curr) => {
    if (curr.powerSource) acc[curr.powerSource] = (acc[curr.powerSource] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const impactDist = data.reduce((acc, curr) => {
    if (curr.electricityImpact) acc[curr.electricityImpact] = (acc[curr.electricityImpact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const costDist = data.reduce((acc, curr) => {
    if (curr.monthlyDataCost) acc[curr.monthlyDataCost] = (acc[curr.monthlyDataCost] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const internetLocDist = data.reduce((acc, curr) => {
    if (curr.internetAccessLocation) acc[curr.internetAccessLocation] = (acc[curr.internetAccessLocation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    electricityReliability: Object.entries(elecDist).map(([name, value]) => ({ name, value })),
    powerSource: Object.entries(powerSourceDist).map(([name, value]) => ({ name, value })),
    electricityImpact: Object.entries(impactDist).map(([name, value]) => ({ name, value })),
    dataCost: Object.entries(costDist).map(([name, value]) => ({ name, value })),
    internetLocation: Object.entries(internetLocDist).map(([name, value]) => ({ name, value }))
  };
};

/**
 * Community Breakdown
 */
export const getCommunityBreakdown = (data: SurveyResponse[]) => {
  const dist = data.reduce((acc, curr) => {
    if (curr.location) acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

/**
 * Response Growth Time Series
 */
export const getResponseGrowthTimeSeries = (data: SurveyResponse[]) => {
  // Group by date (YYYY-MM-DD)
  const countsByDate: Record<string, number> = {};
  
  data.forEach(d => {
    if (d.timestamp) {
      try {
        const dateStr = new Date(d.timestamp).toISOString().split('T')[0];
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
      } catch {
        // invalid date
      }
    }
  });

  const sortedDates = Object.keys(countsByDate).sort();
  
  let cumulative = 0;
  return sortedDates.map(date => {
    cumulative += countsByDate[date];
    return {
      date,
      daily: countsByDate[date],
      cumulative
    };
  });
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

  const statusDist = data.reduce((acc, curr) => {
    if (curr.currentStatus) {
      acc[curr.currentStatus] = (acc[curr.currentStatus] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const ageDist = data.reduce((acc, curr) => {
    if (curr.ageGroup) {
      acc[curr.ageGroup] = (acc[curr.ageGroup] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    gender: Object.entries(genderDist).map(([name, value]) => ({ name, value })),
    education: Object.entries(educationDist).map(([name, value]) => ({ name, value })),
    currentStatus: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
    location: getCommunityBreakdown(data),
    age: Object.entries(ageDist).map(([name, value]) => ({ name, value }))
  };
};

/**
 * Legacy Access Metrics
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

/**
 * Alias for calculateBarrierSeverity — returns barriers ranked by severity.
 * Used by: barriers/page.tsx, recommendations/page.tsx, DataContext.tsx
 */
export const getBarrierMetrics = calculateBarrierSeverity;

/**
 * Alias for calculateCareerAwarenessScore — returns the score as a number.
 * Used by: career-awareness/page.tsx
 */
export const getCareerAwarenessMetrics = (data: SurveyResponse[]) => ({
  score: calculateCareerAwarenessScore(data)
});
