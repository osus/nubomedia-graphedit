import React from 'react';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem, Input } from 'react-bootstrap';

export default class TaskBar extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="col-xs-6">
        <Button id="taskgenerate" className="pull-right" bsStyle="info" onClick={this.props.generateCode} disabled={!this.props.editor.name || !this.props.editor.package}>Generate</Button>
      </div>
    )
  }
}