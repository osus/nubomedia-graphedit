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

export default function nodedefs(state = {defs:{}}, action) {
  switch (action.type) {
  case ActionTypes.ADD_NODEDEF:
    return {
        defs: {...state.defs, [action.payload.name]: action.payload}
    };
  case ActionTypes.ADD_NODEDEFS:
    return {
        defs: {...state.defs, ...action.payload}
    };
  }

  return state;
}