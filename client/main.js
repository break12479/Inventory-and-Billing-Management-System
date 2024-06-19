// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const url = require("url");

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
        },
    });

    // and load the index.html of the app.
    // mainWindow.loadURL('http://localhost:3000/')
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "./index.html"),
            protocol: "file:",
            slashes: true,
        })
    );

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}
function startServer_EXE() {
    console.log("Starting Flask server...");
    const scriptPath = path.join(__dirname, "app", "app.exe");
    const serverProcess = require("child_process").execFile(scriptPath);

    serverProcess.on("error", (err) => {
        console.error("Error starting Flask server:", err);
    });

    serverProcess.on("close", (code) => {
        console.log(`Flask server process exited with code ${code}`);
    });
}

// app.on('ready', startServer_EXE)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    startServer_EXE();
    createWindow();
    // console.log('create window')
    // console.log('after enter function')
    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
            // startServer_EXE()
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



// // Modules to control application life and create native browser window
// const { app, BrowserWindow } = require("electron");
// const path = require("node:path");
// const url = require("url");

// function createWindow() {
//     // Create the browser window.
//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             // preload.js
//             preload: path.join(__dirname, "preload.js"),
//         },
//     });

//     // localhost of web
//     mainWindow.loadURL("http://localhost:3000/");

// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//     createWindow();

//     app.on("activate", function () {
//         // On macOS it's common to re-create a window in the app when the
//         // dock icon is clicked and there are no other windows open.
//         if (BrowserWindow.getAllWindows().length === 0) createWindow();
//     });
// });

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on("window-all-closed", function () {
//     if (process.platform !== "darwin") app.quit();
// });

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
