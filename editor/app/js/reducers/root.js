import { combineReducers } from 'redux';

import * as ActionTypes from "../actions/actionTypes";

import GraphEditor from '../GraphEditor'
import nodedefs from './nodedefs'
import graphs from './graphs'
import {editor, defaultEditorState} from './editor'

// -----------------
// Mutable section for dealing with non-reactive, external pieces
// Having this breaks the purity of React/Redux but we may need it
// until we figure out a better solution for having jsPlumb in the mix
// They should mutate the state in-place and return the passed in state.

var mutable = {
  editor: null,
  editorContainer: null,
}

function _getEditedGraph() {
  if (mutable.editor) {
    return {
      nodes: mutable.editor.getNodes().map((node) =>
        ({type:node.type, name: node.name, x:node.x, y:node.y})
      ),
      connections: mutable.editor.getConnections()
    };
  }
  return {nodes:[], connections: []};
}

function _setupEditor(name, state) {
  if (mutable.editor) {
    mutable.editor.destroy();
    mutable.editor = null;
  }
  if (name) {
    mutable.editor = new GraphEditor(mutable.editorContainer, state.nodedefs);
    if (name in state.graphs) {
      let graph = state.graphs[name];
      mutable.editor.batch( function(editor) {
        graph.nodes.forEach((node) => editor.createNode(node.type, node.name, node.x, node.y));
        graph.connections.forEach((c) => editor.createConnection(c.source, c.sourceEP, c.target, c.targetEP));
      });
    }
  }
}

// Applied to the entire state
function globalReducer(state, action) {
  let newState = state;
  switch (action.type) {
  case ActionTypes.SET_PROJECT:
    newState = {...state,
      graphs: action.payload.graphs,
      editor: {...defaultEditorState, filename: action.payload.filename}
    };
    _setupEditor(name, newState);
    return newState;

  case ActionTypes.CREATE_NODE:
    if (!mutable.editor || !(action.payload.name in state.nodedefs.defs)) {
      return state;
    }
    let posOffsetIndex = (state.editor.curNodeId % 12) - 6;
    let offset = posOffsetIndex * 15;
    mutable.editor.createNode(action.payload.name, "Node_" + state.editor.curNodeId, 400 + offset, 200 + offset);
    return {...state, editor: {...state.editor, curNodeId: state.editor.curNodeId+1}};

  case ActionTypes.SELECT_GRAPH:
    let {name} = action.payload;
    if (name == state.editor.currentGraph) {
      return state;
    }
    // Save currently edited graph
    if (mutable.editor && state.editor.currentGraph) {
      newState = {...newState,
        graphs: { ...newState.graphs, [state.editor.currentGraph]: _getEditedGraph()}
      };
    }
    // Create or restore graph we're switching to
    let graph;
    if (name in newState.graphs) {
      graph = newState.graphs[name];
    } else {
      // Generate new graph name
      // TODO: ensure unique
      if (name == "") {
        name = "Graph_" + Math.floor(Math.random()*10000);
      }
      graph = { nodes: [], connections: [], curNodeId: 1 };
    }
    newState = {...newState,
      graphs: { ...newState.graphs, [name]: graph},
      editor: {...newState.editor, currentGraph: name, curNodeId: graph.curNodeId || 1}
    };
    _setupEditor(name, newState);
    return newState;

  case ActionTypes.SET_GRAPH_PANEL:
    mutable.editorContainer = action.payload.el;
    if (mutable.editorContainer) {
      _setupEditor(state.editor.currentGraph, state);
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

