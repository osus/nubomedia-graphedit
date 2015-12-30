
import * as ActionTypes from "../actions/actionTypes";

export default function graphs(state = {}, action) {
  switch (action.type) {
  case ActionTypes.ADD_GRAPH:
    return action.payload.name? {...state, [action.payload.name]: action.payload.graph} : state;
  }

  return state;
}
