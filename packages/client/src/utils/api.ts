import { gameRegistry } from '../registry/GameRegistry';

const explicitApiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In local dev, default to the local API. In deployed web builds, require VITE_API_URL
// or fall back to same-origin relative paths (for reverse proxies/functions).
export const API_BASE_URL = explicitApiBaseUrl || (isLocalHost ? 'http://localhost:2567' : '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

/**
 * Return headers with an Authorization Bearer token when the game registry
 * has an active session. Import gameRegistry lazily to avoid circular deps.
 */
export function getAuthHeaders(): Record<string, string> {
  if (gameRegistry.accessToken) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${gameRegistry.accessToken}`
    };
  }
  return { 'Content-Type': 'application/json' };
}

/** Convenience wrapper: fetch with auth headers. */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> | undefined)
    }
  });
}
