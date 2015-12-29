// Electron shell bootstrap script

"use strict";

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var ipc = require('electron').ipcMain;
var dialog = require('dialog');
var fs = require('fs');

// Report crashes to our server.
// const crashReporter = require('electron').crashReporter;
// crashReporter.start({
//   productName: 'Nubomedia Graph Editor',
//   companyName: 'Nubomedia Consortium',
//   submitURL: 'https://your-domain.com/url-to-submit',
//   autoSubmit: true
// });


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
    app.quit();
  // }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({/*width: 800, height: 600, "node-integration": false*/});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // -------------------
  // Custom commands
  // -------------------
  ipc.on('selectOpenProject', function(event, arg) {
    console.log('selectOpenProject: ', arg);
    var paths = dialog.showOpenDialog(mainWindow, {
      title:"Open Project",
      filters: [{ name: 'Project files', extensions: ['ngeprj'] },
                { name: 'All Files', extensions: ['*'] }],
      properties: ['openFile']
    });
    event.returnValue = paths?paths[0]:null; // Protect from 'undefined' causing Electron error
  });

  ipc.on('selectSaveProject', function(event, arg) {
    console.log('selectSaveProject: ', arg);
    var path = dialog.showSaveDialog(mainWindow, {
      title:"Save Project as...",
      defaultPath: "untitled.ngeprj",
      filters: [{ name: 'Project files', extensions: ['ngeprj'] },
                { name: 'All Files', extensions: ['*'] }]
    });
    event.returnValue = path?path:null; // Protect from 'undefined' causing Electron error
  });

  ipc.on('readJSONFile', function(event, arg) {
    console.log('readJSONFile: ', arg);
    try {
      let v = fs.readFileSync(arg, "utf8");
      console.log("read: ", v);
      let d = JSON.parse(v);
      event.returnValue = d || {};
    } catch (e) {
      console.log('ERROR: ', e);
      event.returnValue = null;
    }
  });

  ipc.on('writeJSONFile', function(event, arg) {
    console.log('writeJSONFile: ', arg);
    try {
      fs.writeFileSync(arg.filename, JSON.stringify(arg.obj));
      event.returnValue = true;
    } catch (e) {
      console.log('ERROR: ', e);
      event.returnValue = false;
    }
  });
  // -------------------
  // -------------------

  // Open the devtools.
  //mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
