const electron = require('electron')
const { 
  app,
  BrowserWindow,
  ipcMain
 } = electron
 const path = require('path')
require('./index')
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
const verificateWindow = ()=>{
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 400,
      height:500,
      autoHideMenuBar: true,
      icon: __dirname + '/icon.png',
      webPreferences: {
        nodeIntegration: true, // is default value after Electron v5
        contextIsolation: false, // protect against prototype pollution
        enableRemoteModule: true, // turn off remote
        preload: path.join(__dirname, "preload.js"), // use a preload script
        devTools: true
      },
    });
    mainWindow.loadURL('http://localhost:3450')
    ipcMain.on("veryfiUser", (arg,data) => {
      if(data){
        mainWindow.close()
      }
    });
}
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    autoHideMenuBar: true,
    icon: __dirname + '/icon.png',
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: false, // protect against prototype pollution
      enableRemoteModule: true, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
      devTools: true,
    },
  });
  mainWindow.loadURL('http://localhost:3450/home')
};
ipcMain.on("openMainWindow", (arg,data) => {
  if(data){
    createWindow();
  }
});
ipcMain.on("reloadApp", (arg,data) => {
  if(data){
    app.relaunch()
    app.exit()
  }
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // verificate window
  verificateWindow()

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // verificate window
      verificateWindow()
    }
  });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
