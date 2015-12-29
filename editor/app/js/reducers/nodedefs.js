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