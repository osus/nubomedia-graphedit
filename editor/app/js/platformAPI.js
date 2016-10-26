/*
 * (C) Copyright 2016 NUBOMEDIA (http://www.nubomedia.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
