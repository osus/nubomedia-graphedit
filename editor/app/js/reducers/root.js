import { combineReducers } from 'redux';

import * as ActionTypes from "../actions/actionTypes";

import nodedefs from './nodedefs'
import graphs from './graphs'
import {editor, defaultEditorState} from './editor'

import * as mutable from './mutable'

// Applied to the entire state
function globalReducer(state, action) {
  switch (action.type) {
    case ActionTypes.CREATE_PROJECT:
      if (!mutable.getEditor() || !mutable.getEditor().projectClickHandler) {
        throw "No project handler";
      }
      mutable.getEditor().projectClickHandler(action.payload.edit);
      return state;

    case ActionTypes.SET_PROJECT:
      mutable.setupNewEditor(null, state.nodedefs);
      return {...state,
        graphs: action.payload.graphs,
        editor: {...defaultEditorState, ...action.payload.editor}
      };

    case ActionTypes.CREATE_NODE:
      if (!mutable.getEditor() || !(action.payload.type in state.nodedefs.defs)) {
        throw "Unknown node type " + action.payload.type;
      }
      let posOffsetIndex = (state.editor.curNodeId % 12) - 6;
      let offset = posOffsetIndex * 15;
      mutable.getEditor().createNode(action.payload.type, state.nodedefs.defs[action.payload.type], "node_" + state.editor.curNodeId,  "node_" + state.editor.curNodeId, 400 + offset, 200 + offset);
      return {...state,
        editor: {...state.editor, curNodeId: state.editor.curNodeId+1},
        graphs: { ...state.graphs, [state.editor.currentGraph]: mutable.getEditedGraph()}
      };

    case ActionTypes.DELETE_NODE:
      if (!mutable.getEditor() || !(action.payload.node.type in state.nodedefs.defs)) {
        throw "Unknown node type " + action.payload.node.type;
      }
      mutable.getEditor().deleteNode(action.payload.node);
      return {...state,
        graphs: { ...state.graphs, [action.payload.name]: mutable.getEditedGraph()}
      };

    case ActionTypes.CUT_SELECTED_NODE:
      if(!mutable.getEditor() || !mutable.getEditor().selectedNode) {
        throw "No node selected";
        return state;
      }
      let selectedNode = mutable.getEditor().selectedNode;
      mutable.getEditor().copyNode(selectedNode);
      mutable.getEditor().deleteNode(selectedNode);
      return {...state,
        graphs: { ...state.graphs, [action.payload.name]: mutable.getEditedGraph()}
      };

    case ActionTypes.COPY_SELECTED_NODE:
      if(!mutable.getEditor() || !mutable.getEditor().selectedNode) {
        throw "No node selected";
        return state;
      }
      mutable.getEditor().copyNode(mutable.getEditor().selectedNode);
      return state;

    case ActionTypes.PASTE_SELECTED_NODE:
      if(!mutable.getEditor() || !mutable.getEditor().copiedNode) {
        throw "No copied or cut node";
        return state;
      }
      let copiedNode = mutable.getEditor().copiedNode;
      let posCopiedNodeOffsetIndex = (state.editor.curNodeId % 12) - 6;
      let copiedNodeoffset         = posCopiedNodeOffsetIndex * 15;
      mutable.getEditor().createNode(copiedNode.type, state.nodedefs.defs[copiedNode.type], "node_" + state.editor.curNodeId, "node_" + state.editor.curNodeId, 400 + copiedNodeoffset, 200 + copiedNodeoffset);
      return {...state,
        editor: {...state.editor, curNodeId: state.editor.curNodeId+1},
        graphs: { ...state.graphs, [state.editor.currentGraph]: mutable.getEditedGraph()}
      };

    case ActionTypes.DELETE_SELECTED_NODE:
      if(!mutable.getEditor() || !mutable.getEditor().selectedNode) {
        throw "No node selected";
        return state;
      }
      mutable.getEditor().deleteNode(mutable.getEditor().selectedNode);
      return {...state,
        graphs: { ...state.graphs, [action.payload.name]: mutable.getEditedGraph()}
      };

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
        graph.curNodeId = state.editor.curNodeId || 1;
      } else {
        // Generate new graph name
        if (name == "") {
          name = "graph";
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
      mutable.setContainer(action.payload.el, action.payload.projectcb, action.payload.nodecb);
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

