import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  version: () => ipcRenderer.invoke('get-version'),
  platform: () => ipcRenderer.invoke('get-platform'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  minimize: () => ipcRenderer.invoke('minimize-window'),
  close: () => ipcRenderer.invoke('close-window'),
});

declare global {
  interface Window {
    electron: {
      version: () => Promise<string>;
      platform: () => Promise<string>;
      maximize: () => Promise<void>;
      minimize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}
