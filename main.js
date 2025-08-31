const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        frame: false,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
            sandbox: false
        }
    });

    // Create application menu
    const template = [
        {
            label: 'About',
            submenu: [
                {
                    label: 'GitHub Repository',
                    click: async () => {
                        await shell.openExternal('https://github.com/Mr-Ahmadi/Image-Labeling-Studio');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Project',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-project');
                    }
                },
                {
                    label: 'Open Project',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-load-project');
                    }
                },
                {
                    label: 'Save Project',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-save-project');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export All Data',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('menu-export-data');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile('index.html');

    // Handle menu events from renderer
    ipcMain.on('menu-new-project', () => {
        mainWindow.webContents.send('menu-new-project');
    });

    ipcMain.on('menu-load-project', () => {
        mainWindow.webContents.send('menu-load-project');
    });

    ipcMain.on('menu-save-project', () => {
        mainWindow.webContents.send('menu-save-project');
    });

    ipcMain.on('menu-export-data', () => {
        mainWindow.webContents.send('menu-export-data');
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.on('minimize-window', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.minimize();
    });

    ipcMain.on('maximize-window', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    });

    ipcMain.on('close-window', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.close();
    });

    ipcMain.handle('select-directory', async () => {
        const win = BrowserWindow.getFocusedWindow();
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });
        return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('save-project-data', async (event, data, directory) => {
        try {
            const projectPath = path.join(directory, 'project.json');
            await fs.writeJson(projectPath, data, { spaces: 2 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Synchronous save for beforeunload
    ipcMain.handle('save-project-data-sync', (event, data, directory) => {
        try {
            const projectPath = path.join(directory, 'project.json');
            fs.writeJsonSync(projectPath, data, { spaces: 2 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('load-project-data', async (event, directory) => {
        try {
            const projectPath = path.join(directory, 'project.json');
            if (await fs.pathExists(projectPath)) {
                const data = await fs.readJson(projectPath);
                return { success: true, data };
            }
            return { success: false, error: 'Project file not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('copy-file-to-project', async (event, sourcePath, destinationPath) => {
        try {
            await fs.ensureDir(path.dirname(destinationPath));
            await fs.copy(sourcePath, destinationPath);
            return { success: true };
        } catch (error) {
            console.error('Copy error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('read-project-images', async (event, directory) => {
        try {
            const projectPath = path.join(directory, 'project.json');
            
            // If project doesn't exist, return empty array
            if (!(await fs.pathExists(projectPath))) {
                return { success: true, files: [] };
            }

            // Read project data
            const projectData = await fs.readJson(projectPath);
            const projectImages = projectData.images || [];

            // Get image data only for files listed in project.json
            const imageData = await Promise.all(
                projectImages.map(async (img) => {
                    const filePath = path.join(directory, img.fileName);
                    // Check if file actually exists
                    if (await fs.pathExists(filePath)) {
                        const stats = await fs.stat(filePath);
                        return {
                            name: img.fileName,
                            path: filePath,
                            size: stats.size,
                            created: stats.birthtime
                        };
                    }
                    return null;
                })
            );

            // Filter out any null entries (files that don't exist)
            const validImages = imageData.filter(img => img !== null);
            
            return { success: true, files: validImages };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-file-data-url', async (event, filePath) => {
        try {
            const data = await fs.readFile(filePath);
            const base64 = data.toString('base64');
            const extension = path.extname(filePath).toLowerCase();
            let mimeType = 'image/jpeg';
            
            if (extension === '.png') mimeType = 'image/png';
            else if (extension === '.gif') mimeType = 'image/gif';
            else if (extension === '.bmp') mimeType = 'image/bmp';
            else if (extension === '.webp') mimeType = 'image/webp';
            
            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            return null;
        }
    });
    
    ipcMain.handle('write-file-to-project', async (event, arrayBuffer, destinationPath) => {
        try {
            await fs.ensureDir(path.dirname(destinationPath));
            // Convert ArrayBuffer to Buffer for Node.js file system
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(destinationPath, buffer);
            return { success: true };
        } catch (error) {
            console.error('Write file error:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('delete-file', async (event, filePath) => {
        try {
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
                return { success: true };
            }
            return { success: false, error: 'File does not exist' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('export-all-data', async (event, data, directory) => {
        try {
            const exportPath = path.join(directory, 'exported_data.json');
            await fs.writeJson(exportPath, data, { spaces: 2 });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('is-directory-empty', async (event, directory) => {
      try {
        const files = await fs.readdir(directory);
        // Filter out common hidden files that macOS creates
        const visibleFiles = files.filter(file => 
          !file.startsWith('.') && // Hidden files
          file !== 'Thumbs.db' && // Windows thumbnail file
          file !== 'desktop.ini' // Windows desktop config
        );
        return { empty: visibleFiles.length === 0 };
      } catch (error) {
        return { empty: false, error: error.message };
      }
    });

    // Clean up project directory by removing unused images and project entries
    ipcMain.handle('cleanup-project', async (event, directory) => {
      try {
        const projectPath = path.join(directory, 'project.json');
        if (!(await fs.pathExists(projectPath))) {
          return { success: true }; // Nothing to clean up
        }

        const projectData = await fs.readJson(projectPath);
        const projectImageNames = new Set(projectData.images.map(img => img.fileName));

        // Read the directory and get image files
        const files = await fs.readdir(directory);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        const imageFiles = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));

        // Delete image files not in project
        for (const file of imageFiles) {
          if (!projectImageNames.has(file)) {
            await fs.remove(path.join(directory, file));
          }
        }

        // Remove project entries for which the image file doesn't exist
        const validImages = [];
        for (const img of projectData.images) {
          const imagePath = path.join(directory, img.fileName);
          if (await fs.pathExists(imagePath)) {
            validImages.push(img);
          }
        }

        // Only update if there were changes
        if (validImages.length !== projectData.images.length) {
          projectData.images = validImages;
          await fs.writeJson(projectPath, projectData, { spaces: 2 });
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
});

app.on('window-all-closed', () => {
        app.quit();
});