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
// Shortcuts keymap

export function keymap() {
  return {
    NuboEditor: {
      CUT: {
        osx: 'command+x',
        windows: 'ctrl+x',
        linux: 'ctrl+x'
      },
      COPY: {
        osx: 'command+c',
        windows: 'ctrl+c',
        linux: 'ctrl+c'
      },
      PASTE: {
        osx: 'command+v',
        windows: 'ctrl+v',
        linux: 'ctrl+v'
      },
      DELETE: {
        osx: 'command+backspace',
        windows: 'delete',
        linux: 'delete'
      }
    }
  }
}