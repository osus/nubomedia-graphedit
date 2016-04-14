import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap'

import * as platformAPI from './platformAPI'

import rootReducer from './reducers/root'
import * as ActionTypes from "./actions/actionTypes"

import GraphPanel from './components/GraphPanel'
import InfoBar from './components/InfoBar'
import MenuBar from './components/MenuBar'

// -----------------

// Main component, the app so to speak
// TODO: break apart into more components, this is big and unwieldy


class NuboEditor extends React.Component {
  render() {
    return (
      <div>
      <MenuBar
        graphs={this.props.graphs} nodedefs={this.props.nodedefs} editor={this.props.editor}
        createProject={() => this.createProject()}
        editProject={() => this.editProject()}
        loadProject={() => this.loadProject()}
        saveProject={() => this.saveProject()}
        saveProjectAs={() => this.saveProjectAs()}
        onCreateNode={this.props.onCreateNode}
        onGraphSelect={(name) => this.graphSelect(name)}
        onCutSelectedNode={() => this.props.onCutSelectedNode()}
        onCopySelectedNode={() => this.props.onCopySelectedNode()}
        onPasteSelectedNode={() => this.props.onPasteSelectedNode()}
        onDeleteSelectedNode={() => this.props.onDeleteSelectedNode()}
      />
      <InfoBar editor={this.props.editor}
        renameGraph={this.props.onRenameGraph}
      />
      <GraphPanel editor={this.props.editor}
        onSetEditorPanel={this.props.onSetEditorPanel}
        setProjectProperties={(projectName, packageName, graphName) => this.setProjectProperties(projectName, packageName, graphName)}
        onDeleteNode={this.props.onDeleteNode}
        nodedefs={this.props.nodedefs} />
      </div>
    );
  }

  componentDidMount() {
    // Load the default nodedefs
    let nodedefs;
    if (platformAPI.desktopMode) {
      // nodedefs = platformAPI.readJSONFile("data/default.ngend") || {defs:{}}
      nodedefs = {defs:platformAPI.readNodeJSONFiles("data/nodes")};
    } else {
      nodedefs = defaultNodedefs;
    }
    this.props.onAddNodedefs(nodedefs.defs)
  }

  componentWillUnmount() {
    // if (this.editor) {
    //   this.editor.destroy();
    // }
  }

  graphSelect(name) {
    if (name != this.props.editor.currentGraph) {
      this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
      this.props.onGraphSelect(name);
    }
  }

  createProject() {
    this._setProject({}, "");
    this.graphSelect("");
    this.props.onCreateProject(false);
  }

  editProject() {
    if (this.props.editor.name) {
      this.props.onCreateProject(true);
    }
  }

  setProjectProperties(projectName, packageName, graphName) {
    this.props.onSetProjectProperties(projectName, packageName);
    if (graphName != this.props.editor.currentGraph) {
      this.props.onRenameGraph(this.props.editor.currentGraph, graphName);
    }
  }

  loadProject() {
    let path = platformAPI.selectOpenProject();
    console.log(path);
    if (path) {
      let prj = platformAPI.readJSONFile(path) || {graphs:{}, editor: {}};
      this._setProject(prj.graphs, prj.editor, path);
      if (prj.editor.currentGraph) {
        this.graphSelect(prj.editor.currentGraph);
      }
    }
  }

  _setProject(graphs, editor, path) {
    // TODO: Project is NOT SAVED
    this.props.onSetProject(graphs, editor, path);
  }

  saveProject() {
    if (!this.props.editor.filename) {
      this.saveProjectAs();
    } else {
      this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
      platformAPI.writeJSONFile(this.props.editor.filename, {graphs: store.getState().graphs, editor: store.getState().editor}); // UGH getState() after being modified by previous dispatch
    }
  }

  saveProjectAs() {
    let path = platformAPI.selectSaveProject();
    console.log(path);
    if (path) {
      this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
      platformAPI.writeJSONFile(path, {graphs: store.getState().graphs, editor: store.getState().editor}); // UGH getState() after being modified by previous dispatch
      this.props.onSetProjectFilename(path);
    }
  }
}

// --------------------

// Since the browser can't read files, we have a copy of the default nodedefs here to work with
const defaultNodedefs = {
  "defs": {
    "WebRtcEndpoint": { "anchors" : [
      { "name": "src1", "pos":[1, 0.25,  1, 0], "source":true},
      { "name": "src2", "pos":[0, 0.75, -1, 0], "source":true},
      { "name": "tgt1", "pos":[1, 0.75,  1, 0]},
      { "name": "tgt2", "pos":[0, 0.25, -1, 0]}],
      "image": {
        "width": 194,
        "height": 97,
        "name": "WebRtcEndpoint"
      },
      "properties": {
        "testProp": {
          "type": "string",
          "nativeName": "Test Prop"
        },
        "testProp2": {
          "type": "string",
          "nativeName": "Test Prop 2",
          "default": "default value for prop 2"
        },
        "testArrayProp": {
          "type": ["type 1", {"name":"Array Option 2", "value":"type 2"}, "type 3"],
          "nativeName": "Test Array Prop",
          "default": "type 2"
        },
        "testDictionaryProp": {
          "type": {"type1": "Dictionary Option 1", "type2": "Dictionary Option 2"},
          "nativeName": "Test Dictionary Prop",
          "default": "type2"
        }
      }
    },
    "RtpEndpoint": { "anchors" : [
      { "name": "src1", "pos":[1, 0.25,  1, 0], "source":true},
      { "name": "src2", "pos":[0, 0.75, -1, 0], "source":true},
      { "name": "tgt1", "pos":[1, 0.75,  1, 0]},
      { "name": "tgt2", "pos":[0, 0.25, -1, 0]}],
      "image": {
        "width": 195,
        "height": 97,
        "name": "RtpEndpoint"
      },
    },
    "FaceOverlayFilter": { "anchors" : [
      { "name": "src1", "pos":[1, 0.5,  1, 0], "source":true},
      { "name": "tgt1", "pos":[0, 0.5, -1, 0]}],
      "image": {
        "width": 173,
        "height": 78,
        "name": "FaceOverlayFilter"
      },
    },
    "CompositeHub": { "anchors" : [
      { "name": "src1", "pos":[0, 0.5, -1,  0], "source":true},
      { "name": "tgt1", "pos":[1, 0.5,  1,  0]},
      { "name": "tgt2", "pos":[0.5, 0,  0, -1]},
      { "name": "tgt3", "pos":[0.5, 1,  0,  1]}],
      "image": {
        "width": 90,
        "height": 90,
        "name": "CompositeHub"
      },
    },
    "DispatcherHub": { "anchors" : [
      { "name": "src1", "pos":[1, 0.5,  1,  0], "source":true},
      { "name": "src2", "pos":[0, 0.5, -1,  0], "source":true},
      { "name": "tgt1", "pos":[0.5, 0,  0, -1]},
      { "name": "tgt2", "pos":[0.5, 1,  0,  1]}],
      "image": {
        "width": 90,
        "height": 90,
        "name": "DispatcherHub"
      },
    },
    "DispatcherOneToManyHub": { "anchors" : [
      { "name": "src1", "pos":[1, 0.5, 1, 0], "source":true},
      { "name": "src2", "pos":[0.5, 0, 0, -1], "source":true},
      { "name": "src3", "pos":[0, 0.5, -1, 0], "source":true},
      { "name": "tgt1", "pos":[0.5, 1, 0, 1]}],
      "image": {
        "width": 90,
        "height": 90,
        "name": "DispatcherOneToManyHub"
      },
    }
  }
};

let store = createStore(rootReducer);

// Map Redux state to component props
function mapStateToProps(state)  {
  return {
    nodedefs: state.nodedefs,
    graphs: state.graphs,
    editor: state.editor,
  };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    onAddNodedefs: (defs) => dispatch({type:ActionTypes.ADD_NODEDEFS, payload: defs}),

    onAddGraph: (name, graph) => dispatch({type: ActionTypes.ADD_GRAPH, payload: {name, graph}}),
    onSaveCurrentGraph: (name) => dispatch({type: ActionTypes.SAVE_CURRENT_GRAPH, payload: {name}}),
    onGraphSelect: (name) => dispatch({type: ActionTypes.SELECT_GRAPH, payload: {name}}),
    onRenameGraph: (oldName, newName) => dispatch({type: ActionTypes.RENAME_GRAPH, payload: {oldName, newName}}),

    onCreateProject: (edit) => dispatch({type: ActionTypes.CREATE_PROJECT, payload: {edit}}),
    onSetProject: (graphs, editor, filename) => dispatch({type: ActionTypes.SET_PROJECT, payload: {graphs, editor, filename}}),
    onSetProjectFilename: (filename) => dispatch({type: ActionTypes.SET_PROJECT_FILENAME, payload: {filename}}),
    onSetProjectProperties: (projectName, packageName) => dispatch({type: ActionTypes.SET_PROJECT_PROPERTIES, payload: {projectName, packageName}}),

    onCreateNode: (type) => dispatch({type: ActionTypes.CREATE_NODE, payload: {type}}),
    onDeleteNode: (node) => dispatch({type: ActionTypes.DELETE_NODE, payload: {node}}),

    onCutSelectedNode: () => dispatch({type: ActionTypes.CUT_SELECTED_NODE}),
    onCopySelectedNode: () => dispatch({type: ActionTypes.COPY_SELECTED_NODE}),
    onPasteSelectedNode: () => dispatch({type: ActionTypes.PASTE_SELECTED_NODE}),
    onDeleteSelectedNode: () => dispatch({type: ActionTypes.DELETE_SELECTED_NODE}),

    onSetEditorPanel: (el, projectcb, nodecb) => dispatch({type: ActionTypes.SET_GRAPH_PANEL, payload: {el, projectcb, nodecb}}),
  };
}

// Connected Component:
let App = connect(
  mapStateToProps,
  mapDispatchToProps
)(NuboEditor);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
