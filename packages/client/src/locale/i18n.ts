import { STRINGS, Lang, Strings } from '@game/shared';

let current: Lang = 'en';
let strings: Strings = STRINGS[current];

export function loadLanguage(lang: string) {
  const normalized = lang.split('-')[0] as Lang;
  if (STRINGS[normalized]) {
    current = normalized;
    strings = STRINGS[current];
  } else {
    current = 'en';
    strings = STRINGS.en;
  }
}

export function t(key: keyof Strings): string {
  return strings[key];
}

export function getCurrentLanguage(): Lang {
  return current;
}

export { strings };
