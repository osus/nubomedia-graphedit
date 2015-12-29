
import * as ActionTypes from "../actions/actionTypes";

export default function graphs(state = {}, action) {
  switch (action.type) {
  case ActionTypes.ADD_GRAPH:
    return {...state, [action.payload.name]: action.payload}
  }

  return state;
}
