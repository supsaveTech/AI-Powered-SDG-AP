import { SurveyResponse } from '@/types';
import { normalizeCommunityName } from '@/utils/communityNormalizer';

/**
 * Parses raw 2D array from Google Sheets API into strongly typed SurveyResponse array.
 */
export function parseGoogleSheetsData(rows: unknown[][]): SurveyResponse[] {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => String(h).toLowerCase().trim());
  const dataRows = rows.slice(1);

  // Helper to find column index (fuzzy match on expected form header text)
  const getIndex = (searchTerms: string[]) => {
    return headers.findIndex(header => 
      searchTerms.some(term => header.includes(term.toLowerCase()))
    );
  };

  // Map our expected headers. These can be adjusted if the exact form headers change.
  const idxId = getIndex(['id', 'response id']);
  const idxTimestamp = getIndex(['timestamp', 'time']);
  
  // Demographics
  const idxAge = getIndex(['age']);
  const idxGender = getIndex(['gender']);
  const idxLocation = getIndex(['community', 'location', 'live']);
  const idxEducation = getIndex(['education', 'highest level']);
  const idxCurrentStatus = getIndex(['current status', 'currently doing']);
  
  // Digital Access
  const idxSmartphone = getIndex(['smartphone', 'own a smart phone']);
  const idxLaptop = getIndex(['laptop', 'own a laptop']);
  const idxDesktop = getIndex(['desktop']);
  const idxTablet = getIndex(['tablet']);
  const idxInternetRel = getIndex(['internet reliability', 'reliable is the internet']);
  const idxInternetLoc = getIndex(['internet access location', 'often access the internet']);
  const idxElectricityRel = getIndex(['electricity reliability', 'reliable is electricity']);
  const idxPowerSource = getIndex(['power source', 'primary source of power']);
  const idxElectricityImpact = getIndex(['electricity impact', 'lack of electricity impact']);
  const idxDataCost = getIndex(['data cost', 'spend on internet data']);
  
  // Digital Skills
  const idxSkillsPossessed = getIndex(['skills do you possess', 'digital skills']);
  const idxSkillLevel = getIndex(['overall digital skill level', 'rate your overall']);
  const idxCodingExp = getIndex(['coding experience', 'programming or coding']);
  
  // AI Awareness
  const idxUsedAI = getIndex(['used an ai tool', 'used ai']);
  const idxAITools = getIndex(['ai tools have you used', 'which ai tools']);
  const idxAIFreq = getIndex(['how often do you use ai']);
  const idxAIUseCases = getIndex(['primarily use ai for', 'use cases']);
  
  // Career Awareness
  const idxCareersKnown = getIndex(['technology careers are you aware', 'careers known']);
  const idxCareerInterest = getIndex(['consider a career in tech', 'career interest']);
  const idxPreferredTechField = getIndex(['preferred technology field', 'preferred tech field']);
  
  // Employment Readiness
  const idxWorkType = getIndex(['preferred work arrangement', 'preferred work type']);
  const idxDesiredSkills = getIndex(['skills do you think are most important', 'desired skills']);
  
  // Barriers
  const idxBarriers = getIndex(['barriers prevent you', 'barriers to learning']);
  const idxBiggestBarrier = getIndex(['biggest barrier']);
  
  // Qualitative
  const idxSupport = getIndex(['support do you need most', 'support needed']);
  const idxRecs = getIndex(['recommendations for improving', 'recommendations']);

  // Parsing Helpers
  const parseStr = (row: unknown[], idx: number) => (idx !== -1 && row[idx] ? String(row[idx]) : '');
  const parseBool = (row: unknown[], idx: number) => {
    const val = parseStr(row, idx).toLowerCase();
    return val === 'yes' || val === 'true';
  };
  const parseList = (row: unknown[], idx: number) => {
    const val = parseStr(row, idx);
    if (!val) return [];
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };
  const parseAgeGroup = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return val || 'Unknown';
    if (num < 18) return 'Under 18';
    if (num <= 24) return '18-24';
    if (num <= 30) return '25-30';
    if (num <= 35) return '31-35';
    return '36+';
  };

  return dataRows.map((row, i) => {
    const rawLocation = parseStr(row, idxLocation);
    const normalizedLocation = normalizeCommunityName(rawLocation);
    const rawAge = parseStr(row, idxAge);
    
    // Convert old numeric fields if needed
    const skillsPossessed = parseList(row, idxSkillsPossessed);
    
    return {
      id: parseStr(row, idxId) || `response-${i + 1}`,
      timestamp: parseStr(row, idxTimestamp) || new Date().toISOString(),
      
      ageGroup: parseAgeGroup(rawAge),
      age: parseInt(rawAge, 10) || 0,
      gender: parseStr(row, idxGender) || 'Prefer not to say',
      educationLevel: parseStr(row, idxEducation) || 'Other',
      location: normalizedLocation || 'Unknown',
      currentStatus: parseStr(row, idxCurrentStatus),
      
      ownsSmartphone: parseBool(row, idxSmartphone),
      ownsLaptop: parseBool(row, idxLaptop),
      hasDesktopAccess: parseBool(row, idxDesktop),
      hasTabletAccess: parseBool(row, idxTablet),
      internetReliability: parseStr(row, idxInternetRel),
      internetAccessLocation: parseStr(row, idxInternetLoc),
      electricityReliability: parseStr(row, idxElectricityRel),
      powerSource: parseStr(row, idxPowerSource),
      electricityImpact: parseStr(row, idxElectricityImpact),
      monthlyDataCost: parseStr(row, idxDataCost),
      
      digitalSkillsPossessed: skillsPossessed,
      skillLevel: parseStr(row, idxSkillLevel),
      codingExperience: parseStr(row, idxCodingExp),
      
      skillMicrosoftWord: skillsPossessed.some(s => s.toLowerCase().includes('word')) ? 3 : 0,
      skillExcel: skillsPossessed.some(s => s.toLowerCase().includes('excel')) ? 3 : 0,
      skillProgramming: parseBool(row, idxCodingExp) ? 3 : 0,
      skillGraphicDesign: skillsPossessed.some(s => s.toLowerCase().includes('design')) ? 3 : 0,
      skillDigitalMarketing: skillsPossessed.some(s => s.toLowerCase().includes('marketing')) ? 3 : 0,
      skillAITools: parseBool(row, idxUsedAI) ? 3 : 0,
      skillDataAnalysis: skillsPossessed.some(s => s.toLowerCase().includes('data')) ? 3 : 0,
      skillVideoEditing: skillsPossessed.some(s => s.toLowerCase().includes('video')) ? 3 : 0,
      
      hasUsedAI: parseBool(row, idxUsedAI),
      aiToolsUsed: parseList(row, idxAITools),
      aiUsageFrequency: parseStr(row, idxAIFreq),
      aiUseCases: parseList(row, idxAIUseCases),
      
      techCareersKnown: parseList(row, idxCareersKnown),
      careerInterest: parseStr(row, idxCareerInterest),
      preferredTechField: parseStr(row, idxPreferredTechField),
      
      awareSoftwareEngineering: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('software')),
      awareDataScience: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('data')),
      awareAI: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('ai')),
      awareCybersecurity: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('cyber')),
      awareUIUX: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('ux')),
      awareCloudComputing: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('cloud')),
      awareDigitalMarketing: parseList(row, idxCareersKnown).some(c => c.toLowerCase().includes('marketing')),
      
      preferredWorkType: parseStr(row, idxWorkType),
      interestInRemoteWork: parseStr(row, idxWorkType).toLowerCase().includes('remote') ? 'Agree' : 'Neutral',
      desiredSkills: parseList(row, idxDesiredSkills),
      employmentAspirations: parseStr(row, idxWorkType),
      
      barriersToLearning: parseList(row, idxBarriers),
      biggestBarrier: parseStr(row, idxBiggestBarrier),
      
      // Stub numeric barriers (could be computed based on presence in list)
      barrierCost: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('cost') || b.toLowerCase().includes('money')) ? 5 : 2,
      barrierDeviceAccess: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('device') || b.toLowerCase().includes('laptop')) ? 5 : 2,
      barrierInternetAccess: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('internet') || b.toLowerCase().includes('data')) ? 5 : 2,
      barrierMentorship: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('mentor')) ? 5 : 2,
      barrierAwareness: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('aware')) ? 5 : 2,
      barrierTime: parseList(row, idxBarriers).some(b => b.toLowerCase().includes('time')) ? 5 : 2,
      
      supportNeeded: parseStr(row, idxSupport),
      recommendations: parseStr(row, idxRecs),
    };
  });
}
