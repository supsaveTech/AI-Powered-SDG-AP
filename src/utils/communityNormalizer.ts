"use client";

// Pre-defined canonical mapping for Port Harcourt communities
const CANONICAL_COMMUNITY_DICT: Record<string, string> = {
  "elelenwo": "Elelenwo",
  "elenlenwo": "Elelenwo",
  "elelenwa": "Elelenwo",
  "elimgbu": "Elimgbu",
  "eliumgbu": "Elimgbu",
  "elimgbuu": "Elimgbu",
  "rumuokoroh": "Rumuokoro",
  "rumuokoro": "Rumuokoro",
  "wimpey": "Wimpey",
  "diobu": "Diobu",
  "dline": "D-Line",
  "d-line": "D-Line",
  "town": "Town (Port Harcourt)",
  "borokiri": "Borokiri",
  "agip": "Agip",
  "mile 1": "Mile 1",
  "mile 2": "Mile 2",
  "mile 3": "Mile 3",
  "mile 4": "Mile 4",
  "trans amadi": "Trans Amadi",
  "trans-amadi": "Trans Amadi",
  "woji": "Woji",
  "ozuboko": "Ozuboko",
  "abuluoma": "Abuloma",
  "abuloma": "Abuloma",
  "amadi ama": "Amadi-Ama",
  "amadi-ama": "Amadi-Ama",
  "rumuodara": "Rumuodara",
  "rumuokwuta": "Rumuokwuta",
  "rumuola": "Rumuola",
  "rumuigbo": "Rumuigbo",
  "choba": "Choba",
  "alakahia": "Alakahia",
  "orupabo": "Orupabo"
};

/**
 * Calculates the Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export interface MatchResult {
  raw: string;
  normalized: string;
  matchMethod: 'Override' | 'Dictionary' | 'Fuzzy' | 'Raw';
}

/**
 * Gets all manual overrides from local storage
 */
export function getManualOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('community_overrides');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Error reading community_overrides", e);
    return {};
  }
}

/**
 * Sets a manual override in local storage
 */
export function setManualOverride(raw: string, canonical: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getManualOverrides();
    current[raw.toLowerCase().trim()] = canonical;
    localStorage.setItem('community_overrides', JSON.stringify(current));
  } catch (e) {
    console.error("Error saving community_overrides", e);
  }
}

/**
 * Normalizes a community name and returns the matched result info
 */
export function normalizeCommunityNameWithMethod(raw: string): MatchResult {
  if (!raw) return { raw: '', normalized: 'Unknown', matchMethod: 'Raw' };
  
  const normalizedRaw = raw.toLowerCase().trim();
  if (normalizedRaw === '') return { raw, normalized: 'Unknown', matchMethod: 'Raw' };

  // 1. Check manual overrides
  const overrides = getManualOverrides();
  if (overrides[normalizedRaw]) {
    return { raw, normalized: overrides[normalizedRaw], matchMethod: 'Override' };
  }

  // 2. Check canonical dictionary exact match
  if (CANONICAL_COMMUNITY_DICT[normalizedRaw]) {
    return { raw, normalized: CANONICAL_COMMUNITY_DICT[normalizedRaw], matchMethod: 'Dictionary' };
  }

  // 3. Fuzzy matching against canonical dictionary values
  // We use the values to find a close match, e.g. if they typed "Elimgbuu" and it wasn't in the dict
  const uniqueCanonicalValues = Array.from(new Set(Object.values(CANONICAL_COMMUNITY_DICT)));
  
  let bestMatch = null;
  let minDistance = Infinity;

  for (const canonical of uniqueCanonicalValues) {
    const dist = levenshteinDistance(normalizedRaw, canonical.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = canonical;
    }
  }

  // Threshold is Levenshtein distance <= 3
  if (bestMatch && minDistance <= 3) {
    return { raw, normalized: bestMatch, matchMethod: 'Fuzzy' };
  }

  // 4. Fallback to raw value (capitalized properly if possible)
  const capitalizedRaw = raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return { raw, normalized: capitalizedRaw, matchMethod: 'Raw' };
}

/**
 * Normalizes a community name and returns just the canonical string
 */
export function normalizeCommunityName(raw: string): string {
  return normalizeCommunityNameWithMethod(raw).normalized;
}

/**
 * Takes an array of raw community names, normalizes them, and returns a deduplicated array
 */
export function deduplicateCommunities(names: string[]): string[] {
  const normalized = names.map(n => normalizeCommunityName(n));
  return Array.from(new Set(normalized)).filter(Boolean);
}
