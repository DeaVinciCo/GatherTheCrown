import { STRINGS, LanguageCode, StringKey } from '@game/shared';

export const LANGUAGE_STORAGE_KEY = 'gtc_language';

const SUPPORTED: LanguageCode[] = ['en', 'es'];

export function detectBrowserLanguage(): LanguageCode {
  const lang = navigator.language?.toLowerCase().split('-')[0];
  if (SUPPORTED.includes(lang as LanguageCode)) {
    return lang as LanguageCode;
  }
  return 'en';
}

export function resolveLanguage(value: string | null): LanguageCode {
  if (value && SUPPORTED.includes(value as LanguageCode)) {
    return value as LanguageCode;
  }
  return detectBrowserLanguage();
}

let currentLanguage: LanguageCode = resolveLanguage(
  typeof localStorage !== 'undefined' ? localStorage.getItem(LANGUAGE_STORAGE_KEY) : null
);

export function setLanguage(lang: LanguageCode): void {
  currentLanguage = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
}

export function getLanguage(): LanguageCode {
  return currentLanguage;
}

export function t(key: StringKey, language?: LanguageCode): string {
  const lang = language ?? currentLanguage;
  return STRINGS[lang][key] ?? STRINGS['en'][key] ?? key;
}
