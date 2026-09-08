const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let staticServer = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = process.env.VITE_PORT || 5173;
const DEV_URL = `http://localhost:${PORT}`;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

// Start a lightweight local static server for production SPA build
function startStaticServer(callback) {
  let publicDir = path.join(__dirname, '../artifacts/marketflow/dist/public');
  if (!fs.existsSync(publicDir)) {
    publicDir = path.join(app.getAppPath(), 'artifacts/marketflow/dist/public');
  }
  if (!fs.existsSync(publicDir)) {
    publicDir = path.join(process.resourcesPath, 'artifacts/marketflow/dist/public');
  }
  
  staticServer = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(publicDir, reqPath);

    // If file does not exist, fallback to index.html for client-side SPA routing (Wouter)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(publicDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(content);
    });
  });

  // Listen on any free local port
  staticServer.listen(0, '127.0.0.1', () => {
    const assignedPort = staticServer.address().port;
    console.log(`MarketFlow embedded server listening on http://127.0.0.1:${assignedPort}`);
    callback(`http://127.0.0.1:${assignedPort}`);
  });
}

function createMainWindow(targetUrl) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'MarketFlow ERP — نظام إدارة المبيعات ونقاط البيع المتكامل',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('MarketFlow Desktop window loaded successfully.');
  });

  mainWindow.loadURL(targetUrl);

  // Handle new window / popups (such as thermal receipt window)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function checkDevServer(url, callback) {
  const req = http.get(url, (res) => {
    callback(res.statusCode < 400);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(1200, () => {
    req.abort();
    callback(false);
  });
}

// IPC Handlers
ipcMain.handle('print-receipt', async (event, htmlContent) => {
  let printWin = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  return new Promise((resolve) => {
    printWin.webContents.print({ silent: false, printBackground: true }, (success, failureReason) => {
      printWin.close();
      printWin = null;
      resolve({ success, failureReason });
    });
  });
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
  if (isDev) {
    checkDevServer(DEV_URL, (isAlive) => {
      if (isAlive) {
        console.log(`Connecting to Vite Dev Server at ${DEV_URL}`);
        createMainWindow(DEV_URL);
      } else {
        console.log('Dev server not detected, launching embedded production server...');
        startStaticServer((prodUrl) => {
          createMainWindow(prodUrl);
        });
      }
    });
  } else {
    startStaticServer((prodUrl) => {
      createMainWindow(prodUrl);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isDev) {
        createMainWindow(DEV_URL);
      } else {
        startStaticServer((prodUrl) => createMainWindow(prodUrl));
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (staticServer) {
    staticServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
