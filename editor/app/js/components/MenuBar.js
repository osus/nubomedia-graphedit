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
import React from 'react';

import { Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import FileInput from 'react-file-input';

export default class EditorMenu extends React.Component {
  onSelectLoadFile(event) {
    var file = event.target.files[0];
    if (file) {
      this.props.loadProjectFromWeb(file);
    }
  }
  render() {
    var nodedefNames = Object.keys(this.props.nodedefs.defs).map((key) =>
      <MenuItem key={key} onClick={() => this.props.onCreateNode(key)}>
        {key}
      </MenuItem>
    );
    var graphNames = Object.keys(this.props.graphs).map((key) =>
      <MenuItem key={key} onClick={() => this.props.onGraphSelect(key)}>
        {key==this.props.editor.currentGraph? "\u2713 " : ""}{key}
      </MenuItem>
    );
    var loadFile = !window.require ?
      <FileInput name="loadNgeprj" accept=".ngeprj" placeholder="Load" className="fileInput" onChange={this.onSelectLoadFile.bind(this)} /> :
      <MenuItem onClick={this.props.loadProject}>Load</MenuItem>;
    return (
      <Navbar inverse fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">NuboEditor</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown title='Project' id="project-dd">
              <MenuItem onClick={this.props.createProject}>New</MenuItem>
              {loadFile}
              <MenuItem divider />
              <MenuItem onClick={this.props.saveProject} disabled={!this.props.editor.name}>{window.require ? "Save" : "Download"}</MenuItem>
              {window.require ? <MenuItem onClick={this.props.saveProjectAs} disabled={!this.props.editor.name}>Save As…</MenuItem> : null}
              <MenuItem divider />
              <MenuItem onClick={this.props.editProject} disabled={!this.props.editor.name}>Project Properties</MenuItem>
              <MenuItem onClick={this.props.closeProject} disabled={!this.props.editor.name}>Close Project</MenuItem>
            </NavDropdown>
            <NavDropdown title='Edit' id="edit-dd">
              <MenuItem onClick={this.props.onCutSelectedNode}>Cut</MenuItem>
              <MenuItem onClick={this.props.onCopySelectedNode}>Copy</MenuItem>
              <MenuItem onClick={this.props.onPasteSelectedNode}>Paste</MenuItem>
              <MenuItem onClick={this.props.onDeleteSelectedNode}>Delete</MenuItem>
            </NavDropdown>
            <NavDropdown title='Nodes' id="nodes-dd" disabled={!this.props.editor.currentGraph || !this.props.editor.name}>
              { nodedefNames }
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
