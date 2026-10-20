// Canonical education levels (lowest to highest) — the single source of truth
// shared by the profile schema, the seed data, and the opportunity matcher.
//
// These labels come from what the product actually stores: the frontend
// onboarding options, plus 'Diploma/Certificate' and 'Doctorate' which older
// data may contain. Older/alternate spellings are normalised via ALIASES so
// that a label the matcher does not know can never silently pass or fail a
// requirement (previously indexOf returned -1 and `-1 >= -1` made the whole
// education gate pass for everyone).
export const EDUCATION_LEVELS = [
  'Primary (Grade 1-8)',
  'Secondary (Grade 9-10)',
  'Higher Secondary (Grade 11-12)',
  'Diploma/Certificate',
  'Some College',
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate',
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

const ALIASES: Record<string, EducationLevel> = {
  'bachelor degree': "Bachelor's Degree",
  "bachelor's degree": "Bachelor's Degree",
  'primary (grade 1-5)': 'Primary (Grade 1-8)',
  'middle school (grade 6-8)': 'Primary (Grade 1-8)',
  'high school (grade 9-10)': 'Secondary (Grade 9-10)',
  'postgraduate': "Master's Degree",
};

export function normalizeEducationLevel(level: string): EducationLevel | null {
  const trimmed = level.trim();
  if ((EDUCATION_LEVELS as readonly string[]).includes(trimmed)) {
    return trimmed as EducationLevel;
  }
  return ALIASES[trimmed.toLowerCase()] ?? null;
}

// Index into EDUCATION_LEVELS, or -1 when the label is unknown.
export function getEducationIndex(level: string): number {
  const normalized = normalizeEducationLevel(level);
  return normalized ? EDUCATION_LEVELS.indexOf(normalized) : -1;
}

// The user meets the requirement when their level is at or above the lowest
// recognised level the opportunity lists. Unrecognised labels on either side
// are ignored rather than treated as -1: an unknown requirement can no longer
// auto-pass everyone, and a user with an unknown stored level is treated as
// below every known requirement (fail-closed) instead of passing via -1 >= -1.
export function meetsEducationRequirement(userEducation: string, requiredLevels: string[]): boolean {
  if (requiredLevels.length === 0) return true;

  const requiredIndexes = requiredLevels
    .map(getEducationIndex)
    .filter((index) => index >= 0);

  // Requirement lists contain only labels we cannot interpret: nothing
  // verifiable is being required, so don't block on it.
  if (requiredIndexes.length === 0) return true;

  const userIndex = getEducationIndex(userEducation);
  return userIndex >= Math.min(...requiredIndexes);
}
