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
        <Input type='text'
            ref="input_box"
            label={"Project:\u00A0"} // no-break space, must be interpreted as Javascript string
            value={this.state.projectName}>
        </Input>
      </div>
    )
  }
}
