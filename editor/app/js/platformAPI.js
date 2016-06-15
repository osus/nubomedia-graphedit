// Communicating with functions in the electron server process

import * as webApp from './webApp/main';

export const desktopMode = window.require;

var ipc = desktopMode?
  window.require('ipc') // Inside electron shell
  : { sendSync: function(f, arg) { console.log("ipc unavailable in browser mode\n function:", f, "\n args:", JSON.stringify(arg)); return null; } };

export function readJSONFile(filename) {
  return ipc.sendSync('readJSONFile', filename);
}

export function writeJSONFile(filename, obj) {
  return desktopMode ? ipc.sendSync('writeJSONFile', { filename, obj }) : webApp.writeFile(filename, obj);
}

export function readFile(file, callback) {
  return webApp.readFile(file, callback);
}

export function selectOpenProject() {
  return ipc.sendSync('selectOpenProject');
}

export function selectSaveProject(projectname) {
  return desktopMode? ipc.sendSync('selectSaveProject', projectname ) : projectname + ".ngeprj";
}
