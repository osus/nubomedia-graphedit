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
import * as ActionTypes from "../actions/actionTypes";

export const defaultEditorState = {
  currentGraph: null,
  filename: null,
  curNodeId: 0,
  package: "",
  name: ""
};

export function editor(state = defaultEditorState, action) {
  switch (action.type) {
    case ActionTypes.SET_PROJECT_FILENAME:
      return {...state, filename: action.payload.filename};

    case ActionTypes.SET_PROJECT_PROPERTIES:
      return {...state, 'name': action.payload.projectName, 'package': action.payload.packageName}
  }
  return state;
}
