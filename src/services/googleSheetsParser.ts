import { SurveyResponse } from '@/types';
import { normalizeCommunityName } from '@/utils/communityNormalizer';
import { SURVEY_QUESTIONS } from '@/types/surveyQuestions';

export interface HeaderMatchEntry {
  columnIndex: number;
  rawHeader: string;
  normalizedHeader: string;
  matchedQuestion: string | null;
  matchType: 'exact' | 'partial' | 'unmatched';
}

export interface HeaderValidationResult {
  missingHeaders: string[];
  unexpectedHeaders: string[];
  duplicateHeaders: string[];
  isValid: boolean;
  detectedHeaders: HeaderMatchEntry[];
  columnIndexMap: Record<string, number>; // fieldKey -> column index
}

export interface ParseResult {
  data: SurveyResponse[];
  validation: HeaderValidationResult;
}

/**
 * Normalizes a header string by:
 * - Lowercasing
 * - Collapsing all whitespace (including \n, \r, \t) to single spaces
 * - Removing leading/trailing whitespace
 * - Stripping parenthetical sub-clauses like "(Check all that apply)" at the end
 */
function normalizeHeader(raw: string): string {
  return raw
    .replace(/\r?\n|\r/g, ' ')      // replace line breaks with space
    .replace(/\(check all that apply\)/gi, '') // remove "(Check all that apply)"
    .replace(/^\d+\.\s*/, '')       // remove numbering prefixes like "26. "
    .replace(/[.,?]+$/g, '')        // remove trailing punctuation
    .replace(/\s+/g, ' ')           // collapse multiple spaces
    .trim()
    .toLowerCase();
}

/**
 * Parses raw 2D array from Google Sheets API into strongly typed SurveyResponse array.
 */
export function parseGoogleSheetsData(rows: unknown[][]): ParseResult {
  if (!rows || rows.length < 2) {
    return {
      data: [],
      validation: {
        missingHeaders: [], unexpectedHeaders: [], duplicateHeaders: [],
        isValid: false, detectedHeaders: [], columnIndexMap: {}
      }
    };
  }

  const rawHeaders = rows[0].map(h => String(h));
  // Normalize: collapse line breaks + whitespace, trim, lowercase
  const headers = rawHeaders.map(h => normalizeHeader(h));
  const dataRows = rows.slice(1);

  // Detect duplicate normalized headers
  const duplicateHeaders = headers.filter((item, index) => headers.indexOf(item) !== index);
  const missingHeaders: string[] = [];

  /**
   * Find column index by trying each search term as a substring in the normalized headers.
   * If not found, logs to missingHeaders and returns the fallbackIndex.
   */
  const getIndex = (searchTerms: string[], fallbackIndex?: number): number => {
    const idx = headers.findIndex(header =>
      searchTerms.some(term => header.includes(normalizeHeader(term)))
    );
    if (idx === -1 && fallbackIndex !== undefined) {
      const qMeta = SURVEY_QUESTIONS.find(q => q.questionNumber === fallbackIndex);
      if (qMeta) {
        missingHeaders.push(`Q${fallbackIndex}: ${qMeta.questionText}`);
      }
      console.warn(`[GoogleSheetsParser] Could not find header matching: ${searchTerms.join(' OR ')}. Falling back to index ${fallbackIndex}`);
      return fallbackIndex;
    }
    return idx;
  };

  // ─── Map our expected headers against actual normalized Sheets headers ───────
  const idxId            = getIndex(['id', 'response id']);
  const idxTimestamp     = getIndex(['timestamp', 'time']);

  // Demographics
  const idxAge           = getIndex(['age group', 'age '], 3);
  const idxGender        = getIndex(['gender'], 4);
  const idxLocation      = getIndex(['area/community', 'reside in', 'community'], 5);
  const idxEducation     = getIndex(['level of education', 'highest level'], 6);
  const idxCurrentStatus = getIndex(['current status', 'currently doing'], 7);

  // Digital Access
  const idxDevices          = getIndex(['device', 'access to', 'smartphone', 'laptop'], 8);
  const idxInternetRel      = getIndex(['reliable is your internet', 'internet access', 'reliable'], 9);
  const idxInternetLoc      = getIndex(['where do you mostly', 'mostly access the internet', 'location'], 10);
  const idxElectricityRel   = getIndex(['reliable is electricity', 'electricity in your area', 'power supply'], 11);
  const idxPowerSource      = getIndex(['primarily power', 'power your digital', 'generator', 'grid'], 12);
  const idxElectricityImpact= getIndex(['unreliable electricity affect', 'electricity affect', 'affect your ability to learn'], 13);
  const idxDataCost         = getIndex(['spend monthly', 'monthly on internet', 'data access', 'cost'], 14);

  // Digital Skills
  const idxSkillsPossessed  = getIndex(['digital skills do you possess', 'skills do you possess'], 15);
  const idxSkillLevel       = getIndex(['rate your overall digital skill', 'overall digital skill level'], 16);
  const idxCodingExp        = getIndex(['written computer code/programs', 'computer code', 'coding/programs'], 17);

  // AI Awareness
  const idxUsedAI           = getIndex(['used an ai tool before', 'have you used an ai'], 18);
  const idxAITools          = getIndex(['which ai tools have you used', 'ai tools have you used'], 19);
  const idxAIFreq           = getIndex(['how often do you use ai tools', 'often do you use ai'], 20);
  const idxAIUseCases       = getIndex(['primarily use ai tools for', 'use ai tools for', 'use ai for'], 21);

  // Career Awareness
  const idxCareersKnown     = getIndex(['technology careers are you familiar with', 'careers are you familiar'], 22);
  const idxCareerInterest   = getIndex(['consider a career in technology', 'career in technology'], 23);
  const idxPreferredTechField = getIndex(['technology field interests you', 'field interests you'], 24);

  // Employment Readiness
  const idxWorkType         = getIndex(['type of work', 'work are you most interested', 'work arrangement', 'remote'], 25);
  const idxDesiredSkills    = getIndex(['digital skills would you most like', 'skills would you most like', 'skills to learn', 'desired skills'], 26);

  // Barriers
  const idxBarriers         = getIndex(['prevents you from learning digital skills', 'from learning digital skills', 'learning digital skills'], 27);
  const idxBiggestBarrier   = getIndex(['biggest barrier', 'which of these is your biggest'], 28);

  // Qualitative
  const idxSupport          = getIndex(['support would help you improve', 'what support would help'], 29);
  const idxRecs             = getIndex(['done to improve digital readiness', 'improve digital readiness', 'digital readiness among youths'], 30);

  // ─── Build Detected Headers Map for Admin Diagnostics ────────────────────────
  const questionLabels: Record<number, string> = {
    3: 'Age Group', 4: 'Gender', 5: 'Community', 6: 'Education', 7: 'Current Status',
    8: 'Devices', 9: 'Internet Reliability', 10: 'Internet Location', 11: 'Electricity Reliability',
    12: 'Power Source', 13: 'Electricity Impact', 14: 'Data Cost', 15: 'Skills Possessed',
    16: 'Skill Level', 17: 'Coding Experience', 18: 'Used AI', 19: 'AI Tools Used',
    20: 'AI Frequency', 21: 'AI Use Cases', 22: 'Careers Known', 23: 'Career Interest',
    24: 'Preferred Tech Field', 25: 'Work Type', 26: 'Desired Skills', 27: 'Barriers',
    28: 'Biggest Barrier', 29: 'Support Needed', 30: 'Recommendations'
  };

  // Build a reverse map: columnIndex → Q label
  const columnToQuestion: Record<number, string> = {
    [idxAge]: 'Q3: Age Group',
    [idxGender]: 'Q4: Gender',
    [idxLocation]: 'Q5: Community',
    [idxEducation]: 'Q6: Education',
    [idxCurrentStatus]: 'Q7: Current Status',
    [idxDevices]: 'Q8: Devices',
    [idxInternetRel]: 'Q9: Internet Reliability',
    [idxInternetLoc]: 'Q10: Internet Location',
    [idxElectricityRel]: 'Q11: Electricity Reliability',
    [idxPowerSource]: 'Q12: Power Source',
    [idxElectricityImpact]: 'Q13: Electricity Impact',
    [idxDataCost]: 'Q14: Data Cost',
    [idxSkillsPossessed]: 'Q15: Skills Possessed',
    [idxSkillLevel]: 'Q16: Skill Level',
    [idxCodingExp]: 'Q17: Coding Experience',
    [idxUsedAI]: 'Q18: Used AI',
    [idxAITools]: 'Q19: AI Tools',
    [idxAIFreq]: 'Q20: AI Frequency',
    [idxAIUseCases]: 'Q21: AI Use Cases',
    [idxCareersKnown]: 'Q22: Careers Known',
    [idxCareerInterest]: 'Q23: Career Interest',
    [idxPreferredTechField]: 'Q24: Preferred Tech Field',
    [idxWorkType]: 'Q25: Work Type',
    [idxDesiredSkills]: 'Q26: Desired Skills',
    [idxBarriers]: 'Q27: Barriers',
    [idxBiggestBarrier]: 'Q28: Biggest Barrier',
    [idxSupport]: 'Q29: Support Needed',
    [idxRecs]: 'Q30: Recommendations',
  };

  const columnIndexMap: Record<string, number> = {
    desiredSkills: idxDesiredSkills,
    barriersToLearning: idxBarriers,
    biggestBarrier: idxBiggestBarrier,
    supportNeeded: idxSupport,
    recommendations: idxRecs,
  };

  const detectedHeaders: HeaderMatchEntry[] = rawHeaders.map((raw, idx) => {
    const normalized = normalizeHeader(raw);
    const matchedQuestion = columnToQuestion[idx] || null;
    const matchType: 'exact' | 'partial' | 'unmatched' = matchedQuestion
      ? 'partial'
      : 'unmatched';
    return { columnIndex: idx, rawHeader: raw, normalizedHeader: normalized, matchedQuestion, matchType };
  });

  // ─── Parsing Helpers ─────────────────────────────────────────────────────────
  const parseStr = (row: unknown[], idx: number) => (idx !== -1 && row[idx] ? String(row[idx]) : '');
  const parseBool = (row: unknown[], idx: number) => {
    const val = parseStr(row, idx).toLowerCase();
    return val === 'yes' || val === 'true';
  };
  // Google Forms exports multi-selects delimited by commas or semicolons
  const parseList = (row: unknown[], idx: number): string[] => {
    const val = parseStr(row, idx);
    if (!val) return [];
    return val.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  };

  // ─── Row Mapping ─────────────────────────────────────────────────────────────
  const data = dataRows.map((row, i) => {
    const rawLocation = parseStr(row, idxLocation);
    const normalizedLocation = normalizeCommunityName(rawLocation);
    const rawAge = parseStr(row, idxAge);

    const skillsPossessed = parseList(row, idxSkillsPossessed);
    const devicesList = parseList(row, idxDevices);
    const barriersList = parseList(row, idxBarriers);
    const careersKnownList = parseList(row, idxCareersKnown);

    return {
      id: parseStr(row, idxId) || `response-${i + 1}`,
      timestamp: parseStr(row, idxTimestamp) || new Date().toISOString(),

      ageGroup: rawAge || 'Unknown',
      age: 0,
      gender: parseStr(row, idxGender) || 'Prefer not to say',
      educationLevel: parseStr(row, idxEducation) || 'Other',
      location: normalizedLocation || 'Unknown',
      currentStatus: parseStr(row, idxCurrentStatus),

      // Q8: single multi-select column → booleans
      ownsSmartphone:  devicesList.some(d => d.toLowerCase().includes('smartphone') || d.toLowerCase().includes('phone') || d.toLowerCase().includes('mobile')),
      ownsLaptop:      devicesList.some(d => d.toLowerCase().includes('laptop') || d.toLowerCase().includes('computer') || d.toLowerCase().includes('macbook')),
      hasDesktopAccess:devicesList.some(d => d.toLowerCase().includes('desktop') || d.toLowerCase().includes('pc')),
      hasTabletAccess: devicesList.some(d => d.toLowerCase().includes('tablet') || d.toLowerCase().includes('ipad')),

      internetReliability:    parseStr(row, idxInternetRel),
      internetAccessLocation: parseStr(row, idxInternetLoc),
      electricityReliability: parseStr(row, idxElectricityRel),
      powerSource:            parseStr(row, idxPowerSource),
      electricityImpact:      parseStr(row, idxElectricityImpact),
      monthlyDataCost:        parseStr(row, idxDataCost),

      digitalSkillsPossessed: skillsPossessed,
      skillLevel:             parseStr(row, idxSkillLevel),
      codingExperience:       parseStr(row, idxCodingExp),

      skillMicrosoftWord:   skillsPossessed.some(s => s.toLowerCase().includes('word')) ? 3 : 0,
      skillExcel:           skillsPossessed.some(s => s.toLowerCase().includes('excel')) ? 3 : 0,
      skillProgramming:     parseBool(row, idxCodingExp) ? 3 : 0,
      skillGraphicDesign:   skillsPossessed.some(s => s.toLowerCase().includes('design')) ? 3 : 0,
      skillDigitalMarketing:skillsPossessed.some(s => s.toLowerCase().includes('marketing')) ? 3 : 0,
      skillAITools:         parseBool(row, idxUsedAI) ? 3 : 0,
      skillDataAnalysis:    skillsPossessed.some(s => s.toLowerCase().includes('data')) ? 3 : 0,
      skillVideoEditing:    skillsPossessed.some(s => s.toLowerCase().includes('video')) ? 3 : 0,

      hasUsedAI:        parseBool(row, idxUsedAI),
      aiToolsUsed:      parseList(row, idxAITools),
      aiUsageFrequency: parseStr(row, idxAIFreq),
      aiUseCases:       parseList(row, idxAIUseCases),

      techCareersKnown:       careersKnownList,
      careerInterest:         parseStr(row, idxCareerInterest),
      preferredTechField:     parseStr(row, idxPreferredTechField),
      preferredWorkType:      parseStr(row, idxWorkType),
      interestInRemoteWork:   (() => {
        const wt = parseStr(row, idxWorkType).toLowerCase();
        if (wt.includes('remote') || wt.includes('hybrid') || wt.includes('freelance') || wt.includes('work from home') || wt.includes('distributed')) {
          return 'Agree';
        }
        return 'Neutral';
      })(),

      awareSoftwareEngineering: careersKnownList.some(c => c.toLowerCase().includes('software')),
      awareDataScience:         careersKnownList.some(c => c.toLowerCase().includes('data')),
      awareAI:                  careersKnownList.some(c => c.toLowerCase().includes('ai') || c.toLowerCase().includes('artificial')),
      awareCybersecurity:       careersKnownList.some(c => c.toLowerCase().includes('cyber')),
      awareUIUX:                careersKnownList.some(c => c.toLowerCase().includes('ux') || c.toLowerCase().includes('ui')),
      awareCloudComputing:      careersKnownList.some(c => c.toLowerCase().includes('cloud')),
      awareDigitalMarketing:    careersKnownList.some(c => c.toLowerCase().includes('marketing')),

      // interestInRemoteWork string type replaced by boolean earlier
      desiredSkills:       parseList(row, idxDesiredSkills),
      employmentAspirations:parseStr(row, idxWorkType),

      barriersToLearning: barriersList,
      biggestBarrier:     parseStr(row, idxBiggestBarrier),

      barrierCost:          barriersList.some(b => b.toLowerCase().includes('cost') || b.toLowerCase().includes('money')) ? 5 : 2,
      barrierDeviceAccess:  barriersList.some(b => b.toLowerCase().includes('device') || b.toLowerCase().includes('laptop')) ? 5 : 2,
      barrierInternetAccess:barriersList.some(b => b.toLowerCase().includes('internet') || b.toLowerCase().includes('data')) ? 5 : 2,
      barrierMentorship:    barriersList.some(b => b.toLowerCase().includes('mentor')) ? 5 : 2,
      barrierAwareness:     barriersList.some(b => b.toLowerCase().includes('aware')) ? 5 : 2,
      barrierTime:          barriersList.some(b => b.toLowerCase().includes('time')) ? 5 : 2,

      supportNeeded:   parseStr(row, idxSupport),
      recommendations: parseStr(row, idxRecs),

      // Diagnostic Raw Fields
      rawDevices:             parseStr(row, idxDevices),
      rawWorkType:            parseStr(row, idxWorkType),
      rawCareerInterest:      parseStr(row, idxCareerInterest)
    };
  });

  // Diagnostic Log for the first 5 respondents
  data.slice(0, 5).forEach((d, index) => {
    console.log(`[Diagnostic] Respondent ${index + 1}:`, {
      devices: d.rawDevices,
      preferredWorkType: d.rawWorkType,
      careerInterest: d.rawCareerInterest
    });
  });

  return {
    data,
    validation: {
      missingHeaders,
      unexpectedHeaders: [],
      duplicateHeaders,
      isValid: missingHeaders.length === 0,
      detectedHeaders,
      columnIndexMap,
    }
  };
}
