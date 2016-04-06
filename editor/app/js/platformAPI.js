// Communicating with functions in the electron server process

export const desktopMode = window.require;

var ipc = desktopMode?
  window.require('ipc') // Inside electron shell
  : { sendSync: function(f, arg) { console.log("ipc unavailable in browser mode\n function:", f, "\n args:", JSON.stringify(arg)); return null; } };

export function readNodeJSONFiles(directory) {
  return ipc.sendSync('readNodeJSONFiles', directory);
}

export function readJSONFile(filename) {
  return ipc.sendSync('readJSONFile', filename);
}

export function writeJSONFile(filename, obj) {
  return ipc.sendSync('writeJSONFile', { filename, obj });
}

export function selectOpenProject() {
  return ipc.sendSync('selectOpenProject');
}

export function selectSaveProject() {
  return desktopMode? ipc.sendSync('selectSaveProject') : "unnamed.ngeprj";
}
