import React from 'react';

import { Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

export default class EditorMenu extends React.Component {
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
    return (
      <Navbar inverse fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">NuboEditor</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavDropdown title='Project' id="project-dd">
            <MenuItem onClick={this.props.createProject}>New</MenuItem>
            <MenuItem onClick={this.props.loadProject}>Load</MenuItem>
            <MenuItem onClick={this.props.saveProject}>Save</MenuItem>
            <MenuItem onClick={this.props.saveProjectAs}>Save As...</MenuItem>
            <MenuItem divider />
            <MenuItem>Import Nodedefs</MenuItem>
          </NavDropdown>
          <NavDropdown title='Edit' id="edit-dd">
            <MenuItem onClick={this.props.onCutSelectedNode}>Cut</MenuItem>
            <MenuItem onClick={this.props.onCopySelectedNode}>Copy</MenuItem>
            <MenuItem onClick={this.props.onPasteSelectedNode}>Paste</MenuItem>
            <MenuItem onClick={this.props.onDeleteSelectedNode}>Delete</MenuItem>
          </NavDropdown>
          <NavDropdown title='Graphs' id="graphs-dd" disabled={!this.props.editor.name}>
            <MenuItem eventKey='4'
              onClick={()=> {this.props.onGraphSelect("")}}>New Graph</MenuItem>
            <MenuItem divider />
            { graphNames }
          </NavDropdown>
          <NavDropdown title='Nodes' id="nodes-dd" disabled={!this.props.editor.currentGraph}>
            { nodedefNames }
          </NavDropdown>
        </Nav>
      </Navbar>
    );
  }
}
