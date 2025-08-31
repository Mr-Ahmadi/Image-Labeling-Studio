const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld(
    'api', {
        minimizeWindow: () => ipcRenderer.send('minimize-window'),
        maximizeWindow: () => ipcRenderer.send('maximize-window'),
        closeWindow: () => ipcRenderer.send('close-window'),
        selectDirectory: () => ipcRenderer.invoke('select-directory'),
        saveProjectData: (data, directory) => ipcRenderer.invoke('save-project-data', data, directory),
        saveProjectDataSync: (data, directory) => ipcRenderer.invoke('save-project-data-sync', data, directory),
        loadProjectData: (directory) => ipcRenderer.invoke('load-project-data', directory),
        copyFileToProject: (sourcePath, destinationPath) => ipcRenderer.invoke('copy-file-to-project', sourcePath, destinationPath),
        readProjectImages: (directory) => ipcRenderer.invoke('read-project-images', directory),
        getFileDataUrl: (filePath) => ipcRenderer.invoke('get-file-data-url', filePath),
        writeFileToProject: (buffer, destinationPath) => ipcRenderer.invoke('write-file-to-project', buffer, destinationPath),
        deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
        exportAllData: (data, directory) => ipcRenderer.invoke('export-all-data', data, directory),
        cleanupProject: (directory) => ipcRenderer.invoke('cleanup-project', directory),
        path: {
            join: (...args) => path.join(...args),
            basename: (filePath) => path.basename(filePath),
            extname: (filePath) => path.extname(filePath)
        },
        // Menu event listeners
        onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
        onMenuLoadProject: (callback) => ipcRenderer.on('menu-load-project', callback),
        onMenuSaveProject: (callback) => ipcRenderer.on('menu-save-project', callback),
        onMenuExport: (callback) => ipcRenderer.on('menu-export-data', callback),
        isDirectoryEmpty: (directory) => ipcRenderer.invoke('is-directory-empty', directory),
    }
);