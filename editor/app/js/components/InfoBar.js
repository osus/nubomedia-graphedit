import React from 'react';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem, Input } from 'react-bootstrap';

export default class InfoBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {projectName: this.props.editor.name};
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.editor.name != this.state.projectName) {
      this.setState({projectName: nextProps.editor.name});
    }
  }
  render() {
    return (
      <div className="form-inline">
        <h4 style={{'margin-left': '20px'}}>{this.state.projectName ? this.state.projectName : 'NuboEditor'}</h4>
      </div>
    )
  }
}
