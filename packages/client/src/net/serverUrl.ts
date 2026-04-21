const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

const normalizeWsProtocol = (value: string): string => {
  if (value.startsWith('http://')) {
    return value.replace('http://', 'ws://');
  }

  if (value.startsWith('https://')) {
    return value.replace('https://', 'wss://');
  }

  return value;
};

const isLocalHost = (hostname: string): boolean => hostname === 'localhost' || hostname === '127.0.0.1';

export function getRealtimeServerUrl(): string | null {
  const envValue = import.meta.env.VITE_SERVER_WS_URL as string | undefined;

  if (envValue && envValue.trim().length > 0) {
    return trimTrailingSlash(normalizeWsProtocol(envValue.trim()));
  }

  if (isLocalHost(location.hostname)) {
    return `${location.protocol.replace('http', 'ws')}//${location.hostname}:2567`;
  }

  return null;
}
