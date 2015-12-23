import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap';

import * as reducers from './nodedefReducer';
import {
    ADD_NODEDEF, ADD_NODEDEFS,
    ADD_GRAPH, SELECT_GRAPH,
    SET_PROJECT, SET_PROJECT_FILENAME
} from "./actionTypes";

import GraphEditor from './GraphEditor';

import fs from 'fs';

// Communicating with functions in the electron server process
const desktopMode = window.require;
var ipc = desktopMode?
  window.require('ipc') // Inside electron shell
  : { sendSync: function(f, arg) { console.log("ipc unavailable in browser mode"); return null; } };

// Main component, the app so to speak
// TODO: break apart into more components, this is big and unwieldy
class NuboEditor extends React.Component {
  render() {
    var nodedefNames = Object.keys(this.props.nodedefs.defs)
      .map((key) => <MenuItem eventKey={'Nodedef - '+key}
        onClick={() => this.onCreateNode(key, this.props)} >{key}</MenuItem>);
    var graphNames = Object.keys(this.props.graphs)
      .map((key) => <MenuItem eventKey={'Graph - '+key}
        onClick={() => {this.onGraphSelect(key, this.props);this.props.onGraphSelect(key)}}>{key}</MenuItem>);
    return (
      <div>
      <Navbar brand={<a href="#">NuboEditor</a>}>
        <Nav>
          <DropdownButton title='Project'>
            <MenuItem onClick={() => {this.resetProject()} } >New</MenuItem>
            <MenuItem onClick={() => {this.loadProject()} } >Load</MenuItem>
            <MenuItem onClick={() => {this.saveProject()} } >Save</MenuItem>
            <MenuItem onClick={() => {this.saveProjectAs()} } >Save As...</MenuItem>
            <MenuItem divider />
            <MenuItem>Import Nodedefs</MenuItem>
          </DropdownButton>
          <DropdownButton title='Edit'>
            <MenuItem>Cut</MenuItem>
            <MenuItem>Copy</MenuItem>
            <MenuItem>Paste</MenuItem>
            <MenuItem>Delete</MenuItem>
          </DropdownButton>
          <DropdownButton title='Graphs'>
            <MenuItem eventKey='4'
              onClick={()=> {this.onGraphSelect("", this.props);this.props.onGraphSelect(this.curGraph)}}>New Graph</MenuItem>
            <MenuItem divider />
            { graphNames }
          </DropdownButton>
          <DropdownButton title='Nodes' disabled={!this.curGraph}>
            { nodedefNames }
          </DropdownButton>
        </Nav>
      </Navbar>
      <div>Currently editing: {this.props.current}</div>
      <div id="graphpanel" className="panel panel-default" style={{height:"600px",width:"100%"}}>
        <div className="demo nuboged" ref="nuboged_container" id="nuboged-container" >
        </div>
      </div>
      </div>
    );
  }

  componentWillMount() {

  }

  componentDidMount() {
    // This will hurt: storing state in the component
    // Need more practice on how to handle state of non-recative components
    this.editorContainer = $(React.findDOMNode(this.refs.nuboged_container));
    this.editor = null;
    this.curGraph = null;
    this.curId = 1;

    // Load the default nodedefs
    let nodedefs;
    if (desktopMode) {
      nodedefs = ipc.sendSync('readJSONFile', "data/default.ngend") || {defs:{}}
    } else {
      nodedefs = defaultNodedefs;
    }
    store.dispatch({type:ADD_NODEDEFS, payload: nodedefs.defs})

    // this is a bad hack for react-bootstrap not closing the menu on click
    // https://github.com/react-bootstrap/react-bootstrap/issues/368
    // $('#menuBtn a').on('click', function () {
    //   $('#menuBtn .dropdown-toggle').click()
    // })
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  onCreateNode(key, props) {
    if (!this.editor || !(key in props.nodedefs.defs)) {
      return;
    }
    let posOffsetIndex = (this.curId % 12) - 6;
    let offset = posOffsetIndex * 15;
    this.editor.createNode(key, "Node_"+this.curId, 400 + offset, 200 + offset);
    this.curId++;
  }

  onGraphSelect(key, props) {
    if (key == this.curGraph) {
      return;
    }
    if (this.editor) {
      this._saveCurGraph();
      this.editor.destroy();
    }
    this.editor = new GraphEditor(this.editorContainer, props.nodedefs);
    //...
    if (key in props.graphs) {
      let graph = props.graphs[key];
      this.editor.batch( function(editor) {
        graph.nodes.forEach((node) => editor.createNode(node.type, node.name, node.x, node.y));
        graph.connections.forEach((c) => editor.createConnection(c.source, c.sourceEP, c.target, c.targetEP));
      });
    } else {
      key = "Graph_" + this.curId;
      this.curId++;
      props.graphs[key] = { nodes:[], connections:[]};
    }
    this.curGraph = key;
  }

  _saveCurGraph() {
    if (this.curGraph) {
      this.props.graphs[this.curGraph].nodes = this.editor.getNodes().map((node) =>
        ({type:node.type, name: node.name, x:node.x, y:node.y})
      )
      this.props.graphs[this.curGraph].connections = this.editor.getConnections();
    }
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
    this.curGraph = null; // ugh state
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    this.props.onSetProject(graphs, path);
  }

  saveProject() {
    if (!this.props.filename) {
      this.saveProjectAs();
    } else {
      this._saveCurGraph();
      ipc.sendSync('writeJSONFile', {filename:this.props.filename, obj:{graphs:this.props.graphs}});
    }
  }

  saveProjectAs() {
    let path = ipc.sendSync('selectSaveProject', 'ping');
    console.log(path);
    if (path) {
      this._saveCurGraph();
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

// Action:
const defaultState = {
  nodedefs: { defs: {}},
  graphs: {/*
    "Graph 1": {
      nodes: [
        {type:"WebRtcEndpoint", name: "node1", x: 200, y: 100},
      ],
      connections: []
    },
    "Graph 2": {
      nodes: [
        {type:"WebRtcEndpoint", name: "node1", x: 400, y: 20},
        {type:"FaceOverlayFilter", name: "node2", x: 40, y: 200},
        {type:"CompositeHub", name: "node3", x: 400, y: 400},
        {type:"WebRtcEndpoint", name: "node4", x: 800, y: 200},
        {type:"RtpEndpoint", name: "node5", x: 40, y: 400},
        {type:"DispatcherHub", name: "node6", x: 800, y: 20},
        {type:"DispatcherOneToManyHub", name: "node7", x: 40, y: 20},
      ],
      connections: []
    }
  */},
  currentGraph: null,
  filename: null
}

// Reducer:
// TODO: Move to use redux.combineReducers()
function reducer(state=defaultState, action) {
  // Run a reducer that applies to a subsection of the state
  // Ensure state is only updated if subsection is
  function runreducer(state, action, field, reducer) {
    let v = state[field];
    let r = reducer(v, action);
    if (r == v) {
      return state
    }
    return {...state, [field]: r };
  }

  switch(action.type) {
    case SELECT_GRAPH:
      state = {...state, currentGraph: action.payload.name};
  }

  state = runreducer(state, action, "graphs", reducers.graphReducer);
  state = runreducer(state, action, "nodedefs", reducers.nodedefReducer);
  state = reducers.projectReducer(state, action);

  return state;
}

// Store:
let store = createStore(reducer);

// Map Redux state to component props
function mapStateToProps(state)  {
  return {
    nodedefs: state.nodedefs,
    graphs: state.graphs,
    current: state.currentGraph,
    filename: state.filename,
  };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    // TODO: remove: test code
    onAddNodedef: () => dispatch({type:ADD_NODEDEF, payload: {name: "NodeDef!"+Math.round(Math.random()*6)}}),

    onAddNodedefs: () => dispatch({type:ADD_NODEDEFS, payload: defs}),

    onAddGraph: (key) => dispatch({type:ADD_GRAPH, payload: {name: key}}),
    onGraphSelect: (key) => dispatch({type:SELECT_GRAPH, payload: {name: key}}),
    onSetProject: (graphs, filename) => dispatch({type:SET_PROJECT, payload: {graphs, filename}}),
    onSetProjectFilename: (filename) => dispatch({type:SET_PROJECT_FILENAME, payload: {filename}}),
  };
}

// Connected Component:
let App = connect(
  mapStateToProps,
  mapDispatchToProps
)(NuboEditor);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
