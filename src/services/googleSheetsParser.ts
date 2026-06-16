import { SurveyResponse } from '@/types';
import { normalizeCommunityName } from '@/utils/communityNormalizer';
import { SURVEY_QUESTIONS } from '@/types/surveyQuestions';

export interface HeaderValidationResult {
  missingHeaders: string[];
  unexpectedHeaders: string[];
  duplicateHeaders: string[];
  isValid: boolean;
}

export interface ParseResult {
  data: SurveyResponse[];
  validation: HeaderValidationResult;
}

/**
 * Parses raw 2D array from Google Sheets API into strongly typed SurveyResponse array.
 */
export function parseGoogleSheetsData(rows: unknown[][]): ParseResult {
  if (!rows || rows.length < 2) {
    return {
      data: [],
      validation: { missingHeaders: [], unexpectedHeaders: [], duplicateHeaders: [], isValid: false }
    };
  }

  const rawHeaders = rows[0].map(h => String(h).trim());
  const headers = rawHeaders.map(h => h.toLowerCase());
  const dataRows = rows.slice(1);

  // Validation Logic
  const duplicateHeaders = rawHeaders.filter((item, index) => rawHeaders.indexOf(item) !== index);
  const missingHeaders: string[] = [];
  
  // Helper to find column index (fuzzy match on expected form header text)
  const getIndex = (searchTerms: string[], questionNumber?: number): number => {
    const idx = headers.findIndex(header => 
      searchTerms.some(term => header.includes(term.toLowerCase()))
    );
    if (idx === -1 && questionNumber) {
      const qMeta = SURVEY_QUESTIONS.find(q => q.questionNumber === questionNumber);
      if (qMeta) {
        missingHeaders.push(`Q${questionNumber}: ${qMeta.questionText}`);
      }
    }
    return idx;
  };

  // Map our expected headers according to the actual CSV columns
  const idxId = getIndex(['id', 'response id']);
  const idxTimestamp = getIndex(['timestamp', 'time']);
  
  // Demographics
  const idxAge = getIndex(['age group'], 3);
  const idxGender = getIndex(['gender'], 4);
  const idxLocation = getIndex(['area/community'], 5);
  const idxEducation = getIndex(['level of education'], 6);
  const idxCurrentStatus = getIndex(['current status'], 7);
  
  // Digital Access
  const idxDevices = getIndex(['devices do you have regular access to'], 8);
  const idxInternetRel = getIndex(['reliable is your internet access'], 9);
  const idxInternetLoc = getIndex(['where do you mostly access the internet'], 10);
  const idxElectricityRel = getIndex(['reliable is electricity in your area'], 11);
  const idxPowerSource = getIndex(['primarily power your digital devices'], 12);
  const idxElectricityImpact = getIndex(['unreliable electricity affect your ability'], 13);
  const idxDataCost = getIndex(['spend monthly on internet/data'], 14);
  
  // Digital Skills
  const idxSkillsPossessed = getIndex(['digital skills do you possess'], 15);
  const idxSkillLevel = getIndex(['rate your overall digital skill'], 16);
  const idxCodingExp = getIndex(['written computer code/programs'], 17);
  
  // AI Awareness
  const idxUsedAI = getIndex(['used an ai tool before'], 18);
  const idxAITools = getIndex(['which ai tools have you used'], 19);
  const idxAIFreq = getIndex(['how often do you use ai tools'], 20);
  const idxAIUseCases = getIndex(['primarily use ai tools for'], 21);
  
  // Career Awareness
  const idxCareersKnown = getIndex(['technology careers are you familiar with'], 22);
  const idxCareerInterest = getIndex(['consider a career in technology'], 23);
  const idxPreferredTechField = getIndex(['technology field interests you the most'], 24);
  
  // Employment Readiness
  const idxWorkType = getIndex(['type of work are you most interested in'], 25);
  const idxDesiredSkills = getIndex(['digital skills would you most like to learn'], 26);
  
  // Barriers
  const idxBarriers = getIndex(['prevents you from learning digital skills'], 27);
  const idxBiggestBarrier = getIndex(['biggest barrier'], 28);
  
  // Qualitative
  const idxSupport = getIndex(['support would help you improve'], 29);
  const idxRecs = getIndex(['done to improve digital readiness'], 30);

  // Parsing Helpers
  const parseStr = (row: unknown[], idx: number) => (idx !== -1 && row[idx] ? String(row[idx]) : '');
  const parseBool = (row: unknown[], idx: number) => {
    const val = parseStr(row, idx).toLowerCase();
    return val === 'yes' || val === 'true';
  };
  
  // IMPORTANT FIX: Google Forms exports lists delimited by semicolons
  const parseList = (row: unknown[], idx: number) => {
    const val = parseStr(row, idx);
    if (!val) return [];
    return val.split(';').map(s => s.trim()).filter(Boolean);
  };

  const data = dataRows.map((row, i) => {
    const rawLocation = parseStr(row, idxLocation);
    const normalizedLocation = normalizeCommunityName(rawLocation);
    const rawAge = parseStr(row, idxAge);
    
    // Semicolon-delimited arrays
    const skillsPossessed = parseList(row, idxSkillsPossessed);
    const devicesList = parseList(row, idxDevices);
    
    return {
      id: parseStr(row, idxId) || `response-${i + 1}`,
      timestamp: parseStr(row, idxTimestamp) || new Date().toISOString(),
      
      ageGroup: rawAge || 'Unknown',
      age: 0, // Unused since we use ageGroup
      gender: parseStr(row, idxGender) || 'Prefer not to say',
      educationLevel: parseStr(row, idxEducation) || 'Other',
      location: normalizedLocation || 'Unknown',
      currentStatus: parseStr(row, idxCurrentStatus),
      
      // Map multi-select device list to booleans
      ownsSmartphone: devicesList.some(d => d.toLowerCase().includes('smartphone')),
      ownsLaptop: devicesList.some(d => d.toLowerCase().includes('laptop')),
      hasDesktopAccess: devicesList.some(d => d.toLowerCase().includes('desktop')),
      hasTabletAccess: devicesList.some(d => d.toLowerCase().includes('tablet')),
      
      internetReliability: parseStr(row, idxInternetRel),
      internetAccessLocation: parseStr(row, idxInternetLoc), // Note: originally expected string, but UI will need array if multiple
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

  return {
    data,
    validation: {
      missingHeaders,
      unexpectedHeaders: [], // Not fully implemented as we only know what we map
      duplicateHeaders,
      isValid: missingHeaders.length === 0
    }
  };
}
