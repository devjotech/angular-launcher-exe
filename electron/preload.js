const { contextBridge, ipcRenderer } = require('electron');

const listen = (channel) => (cb) => {
  const handler = (_e, payload) => cb(payload);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
};

contextBridge.exposeInMainWorld('api', {
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (data) => ipcRenderer.invoke('state:save', data),
  pickFolder: () => ipcRenderer.invoke('dialog:folder'),
  inspectProject: (dir) => ipcRenderer.invoke('project:inspect', dir),
  listNodeVersions: () => ipcRenderer.invoke('fnm:list'),
  start: (id, args) => ipcRenderer.invoke('proc:start', id, args),
  stop: (id) => ipcRenderer.invoke('proc:stop', id),
  getLog: (id) => ipcRenderer.invoke('proc:log', id),
  clearLog: (id) => ipcRenderer.invoke('proc:clear', id),
  onStatus: listen('proc:status'),
  onData: listen('proc:data'),
});
