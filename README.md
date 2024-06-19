# how to use electron to package react web to windows application

## If this is first time to package

You need to install electron and electron-packager first for frontend

And install pyinstaller for backend(flask)

## for the frontend part:

add below to top line of package.json:

``` json
"main": "main.js"
"homepage": "."
```

add below to script of package.json:

``` json
"electron-start": "electron ."
"package": "electron-packager ./build client --platform=win32 --arch=x64 --electron-version 28.2.0 --overwrite"
```

then you can run `npm run build` in frontend folder and get a 'build' folder

then create a main.js and preload.js in 'build' folder and copy package.json to this folder
main.js should be like:

``` javascript
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


```

preload.js like:
``` javascript
// preload.js

// const { spawn } = require('child_process');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    // startServer_EXE();
});

function startServer_EXE() {
    console.log('Starting Flask server...');
    const scriptPath = path.join(__dirname, 'app', 'app.exe');
    const serverProcess = require('child_process').execFile(scriptPath);
    console.log('path:',scriptPath)
    console.log('result:',serverProcess)
    serverProcess.on('error', (err) => {
        console.error('Error starting Flask server:', err);
    });

    serverProcess.on('close', (code) => {
        console.log(`Flask server process exited with code ${code}`);
    });
}

```

## for the backend part(flask):

Run `Pyinstaller -F -w app.py`

-w: do not open command window
-i: icon file

use conda virtual environment to reduce packaged size(https://blog.csdn.net/libaineu2004/article/details/112612421)

then you will get a 'dist/app' folder, copy 'app' folder to 'build' folder of frontend

## last step

run `pip run package` in frontend folder, then you should get a windows application

## if this is repackage

### for frontend changed:

rebuild `npm run build` in frontend folder

copy package.json, preload.js, main.js(frontend) and 'app' folder(backend) to new 'build' folder

run `pip run package` in frontend folder

### for backend change:

Run `Pyinstaller -F -w app.py`

copy 'app' folder to 'build' folder of frontend

run `pip run package` in frontend folder


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
