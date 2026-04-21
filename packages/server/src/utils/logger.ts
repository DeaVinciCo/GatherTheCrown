import { appendFile } from 'node:fs/promises';

type Level = 'INFO' | 'WARN' | 'ERROR';
type Transport = 'console' | 'remote' | 'file';

const DEFAULT_TRANSPORT: Transport = 'console';
const VALID_TRANSPORTS: ReadonlySet<Transport> = new Set(['console', 'remote', 'file']);

const parseConfiguredTransports = (value: string | undefined): Set<Transport> => {
  if (!value || !value.trim()) {
    return new Set([DEFAULT_TRANSPORT]);
  }

  const configured = value
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const transports = new Set<Transport>();

  for (const t of configured) {
    if (!VALID_TRANSPORTS.has(t as Transport)) {
      console.warn(`[LOGGER] Ignoring unsupported LOG_TRANSPORT value: "${t}"`);
      continue;
    }
    transports.add(t as Transport);
  }

  if (transports.size === 0) {
    transports.add(DEFAULT_TRANSPORT);
  }

  return transports;
};

const transports = parseConfiguredTransports(process.env.LOG_TRANSPORT);
const endpoint = process.env.LOG_REMOTE_ENDPOINT;
const filePath = process.env.LOG_FILE_PATH;
const serviceName = process.env.LOG_SERVICE_NAME ?? 'game-server';

const sendToRemote = async (level: Level, message: string, timestamp: string) => {
  if (!transports.has('remote')) return;
  if (!endpoint) {
    console.warn('[LOGGER] LOG_REMOTE_ENDPOINT is required when using remote transport.');
    return;
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: serviceName, level, message, timestamp })
    });
  } catch (err) {
    console.error('[LOGGER] remote transport failed', err);
  }
};

const sendToFile = async (level: Level, message: string, timestamp: string) => {
  if (!transports.has('file')) return;
  if (!filePath) {
    console.warn('[LOGGER] LOG_FILE_PATH is required when using file transport.');
    return;
  }

  try {
    await appendFile(filePath, `${timestamp} [${level}] ${message}\n`);
  } catch (err) {
    console.error('[LOGGER] file transport failed', err);
  }
};

const writeToConsole = (level: Level, message: string) => {
  if (!transports.has('console')) return;
  const formatted = `[${level}] ${message}`;
  if (level === 'INFO') console.log(formatted);
  else if (level === 'WARN') console.warn(formatted);
  else console.error(formatted);
};

const log = (level: Level, message: string) => {
  const timestamp = new Date().toISOString();
  writeToConsole(level, message);
  void sendToRemote(level, message, timestamp);
  void sendToFile(level, message, timestamp);
};

export const logger = {
  info: (msg: string) => log('INFO', msg),
  warn: (msg: string) => log('WARN', msg),
  error: (msg: string) => log('ERROR', msg)
};
