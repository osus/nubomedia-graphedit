import {
    ADD_NODEDEF,
    ADD_NODEDEFS,
    CREATE_NODE,
    ADD_GRAPH,
    SET_PROJECT,
    SET_PROJECT_FILENAME
} from "./actionTypes";

export function nodedefReducer(state = {defs:{}}, action) {
  switch (action.type) {
  case ADD_NODEDEF:
    return {
        defs: {...state.defs, [action.payload.name]: action.payload}
    };
  case ADD_NODEDEFS:
    return {
        defs: {...state.defs, ...action.payload}
    };
  }

  return state;
}

export function graphReducer(state = {}, action) {
  switch (action.type) {
  case ADD_GRAPH:
    return {...state, [action.payload.name]: action.payload}
  }

  return state;
}


export function projectReducer(state, action) {
  switch (action.type) {
  case SET_PROJECT_FILENAME:
    return {...state, filename:action.payload.filename};
  case SET_PROJECT:
    console.log("SET_PROJECT: ", action.payload.graphs, "\n", action.payload.filename);
    return {...state, graphs: action.payload.graphs, filename:action.payload.filename, currentGraph:""}
  }
  return state;
}