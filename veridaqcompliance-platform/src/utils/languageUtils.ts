/**
 * Supported base language codes for blog translations
 * These are the canonical language codes used throughout the application
 */
export const SUPPORTED_LANGUAGES = [
  'en',  // English
  'da',  // Danish
  'sv',  // Swedish
  'no',  // Norwegian
  'fi',  // Finnish
  'de',  // German
  'fr',  // French
  'es',  // Spanish
  'it',  // Italian
  'pt',  // Portuguese
  'nl',  // Dutch
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Map of full locale codes to base language codes
 */
const LOCALE_TO_BASE_MAP: Record<string, SupportedLanguage> = {
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'da': 'da',
  'da-DK': 'da',
  'sv': 'sv',
  'sv-SE': 'sv',
  'no': 'no',
  'no-NO': 'no',
  'fi': 'fi',
  'fi-FI': 'fi',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'es': 'es',
  'es-ES': 'es',
  'it': 'it',
  'it-IT': 'it',
  'pt': 'pt',
  'pt-PT': 'pt',
  'nl': 'nl',
  'nl-NL': 'nl',
  'nl-BE': 'nl',
};

/**
 * Normalize any language code to its base language code
 * @param languageCode - The language code to normalize (e.g., 'da-DK', 'DA', 'danish')
 * @returns The normalized base language code (e.g., 'da') or 'en' if invalid
 */
export function normalizeLanguageCode(languageCode: string): SupportedLanguage {
  if (!languageCode) return 'en';

  // Convert to lowercase and trim
  const normalized = languageCode.toLowerCase().trim();

  // Check if it's already a valid base code
  if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  // Check if it's a full locale we can map
  if (normalized in LOCALE_TO_BASE_MAP) {
    return LOCALE_TO_BASE_MAP[normalized];
  }

  // Try to extract base code from full locale (e.g., 'da-DK' → 'da')
  const baseCode = normalized.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(baseCode as SupportedLanguage)) {
    return baseCode as SupportedLanguage;
  }

  // Default to English for unrecognized codes
  console.warn(`Unrecognized language code: ${languageCode}, defaulting to 'en'`);
  return 'en';
}

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(languageCode: string): boolean {
  try {
    const normalized = normalizeLanguageCode(languageCode);
    return SUPPORTED_LANGUAGES.includes(normalized);
  } catch {
    return false;
  }
}

/**
 * Get display name for a language code
 */
export function getLanguageDisplayName(languageCode: string): string {
  const base = normalizeLanguageCode(languageCode);

  const displayNames: Record<SupportedLanguage, string> = {
    'en': 'English',
    'da': 'Dansk',
    'sv': 'Svenska',
    'no': 'Norsk',
    'fi': 'Suomi',
    'de': 'Deutsch',
    'fr': 'Français',
    'es': 'Español',
    'it': 'Italiano',
    'pt': 'Português',
    'nl': 'Nederlands',
  };

  return displayNames[base] || 'English';
}
