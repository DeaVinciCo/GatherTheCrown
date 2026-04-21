const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

export function getRealtimeServerUrl(): string {
  const envValue = import.meta.env.VITE_SERVER_WS_URL as string | undefined;

  if (envValue && envValue.trim().length > 0) {
    return trimTrailingSlash(envValue.trim());
  }

  return `${location.protocol.replace('http', 'ws')}//${location.hostname}:2567`;
}
