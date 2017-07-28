const electron = require('electron');
const protocol = electron.protocol;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const splatnet = require('./splatnet2');
const { session } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

electron.protocol.registerStandardSchemes(['npf71b963c1b7b6d119', 'https', 'http']);
function registerSplatnetHandler() {
    protocol.registerHttpProtocol('npf71b963c1b7b6d119',
        (request, callback) => {
            const redirectPath = `https://app.splatoon2.nintendo.net?lang=en-US`;
            console.log(request);
            // console.log(win.webContents.session);
            const url = request.url;
            const params = {};
            const queryString = url.split('#')[1];
            const splitUrl = queryString.split('&').forEach((str) => {
                const splitStr = str.split('=');
                params[splitStr[0]] = splitStr[1];
            });

            console.log(params);
            splatnet.getApiToken2(params.access_token).then((token) => console.log(token));
            // console.log(splatnet.getSplatnetSession(params.session_token_code, params.session_state));

            // callback({ method: request.method, referrer: request.referrer, url: redirectPath });
        },
        (e) => {
            if (e) { console.log(e); }
        },
    )
}

async function loadSplatnetWithSessionToken(sessionToken) {
    const splatnetUrl = `https://app.splatoon2.nintendo.net?lang=en-US`;

    const cookieValues = await splatnet.getSplatnetSession(sessionToken);

    mainWindow.loadURL(splatnetUrl, {
        userAgent: 'com.nintendo.znca/1.0.4 (Android/4.4.2)',
        extraHeaders: `Content-Type: application/json; charset=utf-8\nx-Platform: Android\nx-ProductVersion: 1.0.4\nx-gamewebtoken: ${cookieValues.accessToken}\nx-isappanalyticsoptedin: false\nX-Requested-With: com.nintendo.znca`,
    });
}
exports.loadSplatnetWithSessionToken = loadSplatnetWithSessionToken;

function createWindow() {
    registerSplatnetHandler();

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    mainWindow.loadURL(startUrl);

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
