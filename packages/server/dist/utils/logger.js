import { appendFile } from 'node:fs/promises';
const transport = process.env.LOG_TRANSPORT;
const endpoint = process.env.LOG_REMOTE_ENDPOINT;
const filePath = process.env.LOG_FILE_PATH;
const sendToRemote = (level, message) => {
    if (transport !== 'remote' || !endpoint)
        return;
    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message })
    }).catch((err) => console.error('[LOGGER] remote transport failed', err));
};
const sendToFile = (level, message) => {
    if (transport !== 'file' || !filePath)
        return;
    appendFile(filePath, `${new Date().toISOString()} [${level}] ${message}\n`).catch((err) => console.error('[LOGGER] file transport failed', err));
};
const log = (level, msg) => {
    const formatted = `[${level}] ${msg}`;
    if (level === 'INFO')
        console.log(formatted);
    else if (level === 'WARN')
        console.warn(formatted);
    else
        console.error(formatted);
    sendToRemote(level, msg);
    sendToFile(level, msg);
};
export const logger = {
    info: (msg) => log('INFO', msg),
    warn: (msg) => log('WARN', msg),
    error: (msg) => log('ERROR', msg)
};
