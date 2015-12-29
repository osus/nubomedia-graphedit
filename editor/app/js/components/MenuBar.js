import React from 'react';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap';

export default class EditorMenu extends React.Component {
  render() {
    var nodedefNames = Object.keys(this.props.nodedefs.defs)
      .map((key) => <MenuItem eventKey={'Nodedef - '+key}
        onClick={() => this.props.onCreateNode(key)} >{key}</MenuItem>);
    var graphNames = Object.keys(this.props.graphs)
      .map((key) => <MenuItem eventKey={'Graph - '+key}
        onClick={() => this.props.onGraphSelect(key)}>{key}</MenuItem>);
    return (
      <Navbar brand={<a href="#">NuboEditor</a>}>
        <Nav>
          <DropdownButton title='Project'>
            <MenuItem onClick={this.props.resetProject} >New</MenuItem>
            <MenuItem onClick={this.props.loadProject} >Load</MenuItem>
            <MenuItem onClick={this.props.saveProject} >Save</MenuItem>
            <MenuItem onClick={this.props.saveProjectAs} >Save As...</MenuItem>
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
              onClick={()=> {this.props.onGraphSelect("")}}>New Graph</MenuItem>
            <MenuItem divider />
            { graphNames }
          </DropdownButton>
          <DropdownButton title='Nodes' disabled={!this.curGraph}>
            { nodedefNames }
          </DropdownButton>
        </Nav>
      </Navbar>
    );
  }
}
