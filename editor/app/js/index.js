import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap'

import rootReducer from './reducers/root'
import * as ActionTypes from "./actions/actionTypes"

import GraphPanel from './components/GraphPanel'
import InfoBar from './components/InfoBar'
import MenuBar from './components/MenuBar'

// Communicating with functions in the electron server process
const desktopMode = window.require;
var ipc = desktopMode?
  window.require('ipc') // Inside electron shell
  : { sendSync: function(f, arg) { console.log("ipc unavailable in browser mode"); return null; } };

// -----------------

// Main component, the app so to speak
// TODO: break apart into more components, this is big and unwieldy


class NuboEditor extends React.Component {
  render() {
    return (
      <div>
      <MenuBar
        graphs={this.props.graphs} nodedefs={this.props.nodedefs} editor={this.props.editor}
        resetProject={() => this.resetProject()}
        loadProject={() => this.loadProject()}
        saveProject={() => this.saveProject()}
        saveProjectAs={() => this.saveProjectAs()}
        onCreateNode={this.props.onCreateNode}
        onGraphSelect={this.props.onGraphSelect}
      />
      <InfoBar editor={this.props.editor} />
      <GraphPanel onSetEditorPanel={this.props.onSetEditorPanel} />
      </div>
    );
  }

  componentDidMount() {
    // Load the default nodedefs
    let nodedefs;
    if (desktopMode) {
      nodedefs = ipc.sendSync('readJSONFile', "data/default.ngend") || {defs:{}}
    } else {
      nodedefs = defaultNodedefs;
    }
    store.dispatch({type:ActionTypes.ADD_NODEDEFS, payload: nodedefs.defs})
  }

  componentWillUnmount() {
    // if (this.editor) {
    //   this.editor.destroy();
    // }
  }

  resetProject() {
    this._setProject({}, "");
  }

  loadProject() {
    let path = ipc.sendSync('selectOpenProject', 'ping');
    console.log(path);
    if (path) {
      let prj = ipc.sendSync('readJSONFile', path) || {graphs:{}};
      this._setProject(prj.graphs, path);
    }
  }

  _setProject(graphs, path) {
    // TODO: Project is NOT SAVED
    this.props.onSetProject(graphs, path);
  }

  saveProject() {
    if (!this.props.editor.filename) {
      this.saveProjectAs();
    } else {
      // TODO: Current graph edits are NOT SAVED
      ipc.sendSync('writeJSONFile', {filename:this.props.editor.filename, obj:{graphs:this.props.graphs}});
    }
  }

  saveProjectAs() {
    let path = ipc.sendSync('selectSaveProject', 'ping');
    console.log(path);
    if (path) {
      // TODO: Current graph edits are NOT SAVED
      ipc.sendSync('writeJSONFile', {filename:path, obj:{graphs:this.props.graphs}});
      this.props.onSetProjectFilename(path);
    }
  }
}

// --------------------

// Since the browser can't read files, we have a copy of the default nodedefs here to work with
const defaultNodedefs = {
  defs: {
    "WebRtcEndpoint": { anchors : [
      { name: "src1", pos:[1, 0.25,  1, 0], source:true},
      { name: "src2", pos:[0, 0.75, -1, 0], source:true},
      { name: "tgt1", pos:[1, 0.75,  1, 0]},
      { name: "tgt2", pos:[0, 0.25, -1, 0]}]},
    "RtpEndpoint": { anchors : [
      { name: "src1", pos:[1, 0.25,  1, 0], source:true},
      { name: "src2", pos:[0, 0.75, -1, 0], source:true},
      { name: "tgt1", pos:[1, 0.75,  1, 0]},
      { name: "tgt2", pos:[0, 0.25, -1, 0]}]},
    "FaceOverlayFilter": { anchors : [
      { name: "src1", pos:[1, 0.5,  1, 0], source:true},
      { name: "tgt1", pos:[0, 0.5, -1, 0]}]},
    "CompositeHub": {anchors : [
      { name: "src1", pos:[0, 0.5, -1,  0], source:true},
      { name: "tgt1", pos:[1, 0.5,  1,  0]},
      { name: "tgt2", pos:[0.5, 0,  0, -1]},
      { name: "tgt3", pos:[0.5, 1,  0,  1]}]},
    "DispatcherHub": { anchors : [
      { name: "src1", pos:[1, 0.5,  1,  0], source:true},
      { name: "src2", pos:[0, 0.5, -1,  0], source:true},
      { name: "tgt1", pos:[0.5, 0,  0, -1]},
      { name: "tgt2", pos:[0.5, 1,  0,  1]}]},
    "DispatcherOneToManyHub": { anchors : [
      { name: "src1", pos:[1, 0.5, 1, 0], source:true},
      { name: "src2", pos:[0.5, 0, 0, -1], source:true},
      { name: "src3", pos:[0, 0.5, -1, 0], source:true},
      { name: "tgt1", pos:[0.5, 1, 0, 1]}]}
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
    // TODO: remove: test code
    //onAddNodedef: () => dispatch({type:ActionTypes.ADD_NODEDEF, payload: {name: "NodeDef!"+Math.round(Math.random()*6)}}),

    //onAddNodedefs: () => dispatch({type:ActionTypes.ADD_NODEDEFS, payload: defs}),

    //onAddGraph: (key) => dispatch({type:ActionTypes.ADD_GRAPH, payload: {name: key}}),
    onGraphSelect: (name) => dispatch({type:ActionTypes.SELECT_GRAPH, payload: {name}}),
    onSetProject: (graphs, filename) => dispatch({type:ActionTypes.SET_PROJECT, payload: {graphs, filename}}),
    onSetProjectFilename: (filename) => dispatch({type:ActionTypes.SET_PROJECT_FILENAME, payload: {filename}}),
    onCreateNode: (name) => dispatch({type:ActionTypes.CREATE_NODE, payload: {name}}),
    onSetEditorPanel: (el) => dispatch({ type: ActionTypes.SET_GRAPH_PANEL, payload: {el}}),
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
