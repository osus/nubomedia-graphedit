import * as ActionTypes from "../actions/actionTypes";

export const defaultEditorState = {
  currentGraph: null,
  filename: null,
  curNodeId: 0,
};

export function editor(state = defaultEditorState, action) {
  switch (action.type) {
  case ActionTypes.SET_PROJECT_FILENAME:
    return {...state, filename:action.payload.filename};
  }
  return state;
}
