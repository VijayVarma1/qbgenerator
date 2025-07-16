const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL
        ? process.env.ELECTRON_START_URL
        : `file://${path.join(__dirname, 'app/build/index.html')}`;

    win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Parse DOCX and PDF
ipcMain.handle('parse-file', async (_, filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return { content: data.text };
        } else if (ext === '.docx' || ext === '.doc') {
            const data = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: data });
            return { content: result.value };
        } else {
            return { error: 'Unsupported file type' };
        }
    } catch (err) {
        return { error: err.message };
    }
});
