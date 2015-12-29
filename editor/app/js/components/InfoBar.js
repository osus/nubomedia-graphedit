import React from 'react';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap';

export default class InfoBar extends React.Component {
  render() {
    return (
      <div>Currently editing: {this.props.editor.currentGraph}</div>
    )
  }
}
