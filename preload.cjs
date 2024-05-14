const { contextBridge, ipcRenderer } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const Toastify = require('toastify-js');

// import { contextBridge, ipcRenderer } from 'electron';
// import path from 'node:path';
// import fs from 'node:fs';
// import os from 'node:os';
// import Toastify from 'toastify-js';

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld('Toastify', {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on:  (channel, data, func) => ipcRenderer.on(channel, data, (event, ...args) => func(...args)),
    request: (channel, data) => ipcRenderer.invoke(channel, data),
    // selectFolder: () => ipcRenderer.invoke('dialog:openDirectory')
});

contextBridge.exposeInMainWorld('fs', {
    readdirSync: (...args) => fs.readdirSync(...args),
});