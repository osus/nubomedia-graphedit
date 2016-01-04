import { combineReducers } from 'redux';

import * as ActionTypes from "../actions/actionTypes";

import nodedefs from './nodedefs'
import graphs from './graphs'
import {editor, defaultEditorState} from './editor'

import * as mutable from './mutable'

// Applied to the entire state
function globalReducer(state, action) {
  switch (action.type) {
  case ActionTypes.SET_PROJECT:
    mutable.setupNewEditor(null, state.nodedefs);
    return {...state,
      graphs: action.payload.graphs,
      editor: {...defaultEditorState, filename: action.payload.filename}
    };

  case ActionTypes.CREATE_NODE:
    if (!mutable.getEditor() || !(action.payload.type in state.nodedefs.defs)) {
      throw "Unknown node type " + action.payload.type;
      return state;
    }
    let posOffsetIndex = (state.editor.curNodeId % 12) - 6;
    let offset = posOffsetIndex * 15;
    mutable.getEditor().createNode(action.payload.type, state.nodedefs.defs[action.payload.type], "Node_" + state.editor.curNodeId, 400 + offset, 200 + offset);
    return {...state, editor: {...state.editor, curNodeId: state.editor.curNodeId+1}};

  case ActionTypes.SAVE_CURRENT_GRAPH:
    if (mutable.getEditor() && action.payload.name) {
      return {...state,
        graphs: { ...state.graphs, [action.payload.name]: mutable.getEditedGraph()}
      };
    }
    return state;

  case ActionTypes.SELECT_GRAPH:
    let {name} = action.payload;
    // Create or restore graph we're switching to
    let graph;
    if (name in state.graphs) {
      graph = state.graphs[name];
    } else {
      // Generate new graph name
      // TODO: ensure unique
      if (name == "") {
        name = "Graph_" + Math.floor(Math.random()*10000);
      }
      graph = { nodes: [], connections: [], curNodeId: 1 };
    }
    mutable.setupNewEditor(graph, state.nodedefs);
    return {...state,
      graphs: { ...state.graphs, [name]: graph},
      editor: {...state.editor, currentGraph: name, curNodeId: graph.curNodeId || 1}
    };

  case ActionTypes.RENAME_GRAPH:
    // TODO: perform more validation on the names
    let newGraphs = {...state.graphs, [action.payload.newName]: state.graphs[action.payload.oldName]};
    delete newGraphs[action.payload.oldName];
    let newEditor = state.editor;
    if (state.editor.currentGraph == action.payload.oldName) {
      newEditor = {...state.editor, currentGraph: action.payload.newName};
    }
    return {...state,
      graphs: newGraphs,
      editor: newEditor
    };

  case ActionTypes.SET_GRAPH_PANEL:
    mutable.setContainer(action.payload.el);
    if (action.payload.el) {
      mutable.setupNewEditor(state.graphs[state.editor.currentGraph], state.nodedefs);
    }
    return state;
  }
  return state;
}

// -----------------

const partialReducers = combineReducers({
  graphs,
  nodedefs,
  editor
});

export default function(state={}, action) {
  state = partialReducers(state, action);
  state = globalReducer(state, action);

  return state;
}

