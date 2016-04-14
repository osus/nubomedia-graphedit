import * as ActionTypes from "../actions/actionTypes";

export const defaultEditorState = {
  currentGraph: null,
  filename: null,
  curNodeId: 0,
  package: null,
  name: null
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
