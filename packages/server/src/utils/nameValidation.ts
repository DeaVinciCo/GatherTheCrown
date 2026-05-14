import {
  DISPLAY_NAME_MAX_CHARS,
  DISPLAY_NAME_MAX_WORDS,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH
} from '../constants/GameConstants';

const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export function normalizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
    return `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username can use letters, numbers, _ and - only.';
  }
  return null;
}

export function validateDisplayName(name: string, label = 'Name'): string | null {
  if (!name) {
    return `${label} cannot be empty.`;
  }
  if (name.length > DISPLAY_NAME_MAX_CHARS) {
    return `${label} must be ${DISPLAY_NAME_MAX_CHARS} characters or fewer.`;
  }
  const words = name.split(/\s+/).filter(Boolean).length;
  if (words > DISPLAY_NAME_MAX_WORDS) {
    return `${label} must be ${DISPLAY_NAME_MAX_WORDS} words or fewer.`;
  }
  return null;
}
