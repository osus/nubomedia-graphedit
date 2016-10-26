/*
 * (C) Copyright 2016 NUBOMEDIA (http://www.nubomedia.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react'
import ReactDOM from 'react-dom'
import ShortcutsManager from 'react-shortcuts'

import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap'
import Shortcuts from 'react-shortcuts/component'

import * as nodes from './nodes';
import * as platformAPI from './platformAPI'
import * as shortcutKeymap from './keymap'

import rootReducer from './reducers/root'
import * as ActionTypes from "./actions/actionTypes"

import GraphPanel from './components/GraphPanel'
import TaskBar from './components/TaskBar'
import InfoBar from './components/InfoBar'
import MenuBar from './components/MenuBar'

// -----------------

// Main component, the app so to speak
// TODO: break apart into more components, this is big and unwieldy

class NuboEditor extends React.Component {
  render() {
    return (
      <div>
        <Shortcuts
          name="NuboEditor"
          className="shortcut"
          handler={this.handleShortcuts.bind(this)}>
          <MenuBar
            graphs={this.props.graphs} nodedefs={this.props.nodedefs} editor={this.props.editor}
            createProject={() => this.createProject()}
            editProject={() => this.editProject()}
            loadProject={() => this.loadProject()}
            loadProjectFromWeb={(file) => this.loadProjectFromWeb(file)}
            saveProject={() => this.saveProject()}
            saveProjectAs={() => this.saveProjectAs()}
            closeProject={() => this.closeProject()}
            onCreateNode={this.props.onCreateNode}
            onCutSelectedNode={() => this.props.onCutSelectedNode()}
            onCopySelectedNode={() => this.props.onCopySelectedNode()}
            onPasteSelectedNode={() => this.props.onPasteSelectedNode()}
            onDeleteSelectedNode={() => this.props.onDeleteSelectedNode()}
          />
          <InfoBar
            editor={this.props.editor}
            renameGraph={this.props.onRenameGraph}
          />
          <TaskBar
            editor={this.props.editor}
            generateCode={() => this.generateCode()}
          />
          <GraphPanel
            editor={this.props.editor} graphs={this.props.graphs}
            onValidatePanel={this.props.onValidatePanel}
            onSetEditorPanel={this.props.onSetEditorPanel}
            setProjectProperties={(projectName, packageName, graphName) => this.setProjectProperties(projectName, packageName, graphName)}
            closeProject={() => this.closeProject(true)}
            onDeleteNode={this.props.onDeleteNode}
            onSaveCurrentGraph={this.props.onSaveCurrentGraph}
            nodedefs={this.props.nodedefs}
          />
        </Shortcuts>
      </div>
    );
  }

  componentDidMount() {
    // Load nodedefs
    let nodedefs = {defs:nodes.nodes};
    this.props.onAddNodedefs(nodedefs.defs);
  }

  static childContextTypes = {
    shortcuts: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      shortcuts: new ShortcutsManager(shortcutKeymap.keymap())
    }
  }

  handleShortcuts(action) {
    console.log(action);
    switch (action) {
      case 'CUT':
        return this.props.onCutSelectedNode();
      case 'COPY':
        return this.props.onCopySelectedNode();
      case 'PASTE':
        return this.props.onPasteSelectedNode();
      case 'DELETE':
        return this.props.onDeleteSelectedNode();
    }
  }

  graphSelect(name) {
    this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
    this.props.onGraphSelect(name);
  }

  createProject() {
    this._setProject({}, "");
    this.graphSelect("graph");
    this.props.onCreateProject(false);
  }

  editProject() {
    if (this.props.editor.name) {
      this.props.onCreateProject(true);
    }
  }

  closeProject(force) {
    if (force || this.props.editor.name) {
      this._setProject({}, "");
    }
  }

  setProjectProperties(projectName, packageName) {
    this.props.onSetProjectProperties(projectName, packageName);
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

  loadProjectFromWeb(file) {
    let done = (prj) => {
      prj = prj || {graphs:{}, editor: {}};
      this._setProject(prj.graphs, prj.editor, "");
      if (prj.editor.currentGraph) {
        this.graphSelect(prj.editor.currentGraph);
      }
    };
    platformAPI.readFile(file, done);
  }

  _setProject(graphs, editor, path) {
    // TODO: Project is NOT SAVED
    this.props.onSetProject(graphs, editor, path);
  }

  saveProject() {
    if (this.props.editor.name) {
      if (!this.props.editor.filename) {
        this.saveProjectAs();
      } else {
        this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
        platformAPI.writeJSONFile(this.props.editor.filename, {
          graphs: store.getState().graphs,
          editor: store.getState().editor
        }); // UGH getState() after being modified by previous dispatch
      }
    }
  }

  saveProjectAs() {
    if (this.props.editor.name) {
      let path = platformAPI.selectSaveProject(this.props.editor.name);
      console.log(path);
      if (path) {
        this.props.onSaveCurrentGraph(this.props.editor.currentGraph);
        platformAPI.writeJSONFile(path, {graphs: store.getState().graphs, editor: store.getState().editor}); // UGH getState() after being modified by previous dispatch
        this.props.onSetProjectFilename(path);
      }
    }
  }

  generateCode() {
    this.props.onGenerateCode({
      graphs: store.getState().graphs,
      editor: store.getState().editor
    });
  }
}

let store = createStore(rootReducer);

// Map Redux state to component props
function mapStateToProps(state)  {
  return {
    nodedefs: state.nodedefs,
    graphs: state.graphs,
    editor: state.editor
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
    onGenerateCode: (project) => dispatch({type: ActionTypes.GENERATE_CODE, payload: {project}}),

    onCreateNode: (type) => dispatch({type: ActionTypes.CREATE_NODE, payload: {type}}),
    onDeleteNode: (node) => dispatch({type: ActionTypes.DELETE_NODE, payload: {node}}),

    onCutSelectedNode: () => dispatch({type: ActionTypes.CUT_SELECTED_NODE}),
    onCopySelectedNode: () => dispatch({type: ActionTypes.COPY_SELECTED_NODE}),
    onPasteSelectedNode: () => dispatch({type: ActionTypes.PASTE_SELECTED_NODE}),
    onDeleteSelectedNode: () => dispatch({type: ActionTypes.DELETE_SELECTED_NODE}),

    onSetEditorPanel: (el, projectcb, nodecb, validatecb, generatecodecb) => dispatch({type: ActionTypes.SET_GRAPH_PANEL, payload: {el, projectcb, nodecb, validatecb, generatecodecb}}),

    onValidatePanel: () => dispatch({type: ActionTypes.VALIDATE_PANEL})
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
