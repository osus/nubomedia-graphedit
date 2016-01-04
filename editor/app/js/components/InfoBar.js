import React from 'react';

import { Button, Navbar, Nav, NavItem, DropdownButton, MenuItem, Input } from 'react-bootstrap';

export default class InfoBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {currentGraph: this.props.editor.currentGraph};
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.editor.currentGraph != this.state.currentGraph) {
      this.setState({currentGraph: nextProps.editor.currentGraph});
    }
  }
  render() {
    let onChangeName = (e) => {
      this.setState({currentGraph: e.target.value})
    }
    let onKeydownName = (e) => {
        if (e.keyCode == 13) {
          this.props.renameGraph(this.props.editor.currentGraph, this.state.currentGraph);
          this.refs.input_box.getInputDOMNode().blur();
        } else if (e.keyCode == 27) {
          this.setState({currentGraph: this.props.editor.currentGraph})
          this.refs.input_box.getInputDOMNode().blur();
        }
    }
    return (
      <div className="form-inline">
        <Input type='text'
            ref="input_box"
            label="Currently editing:"
            onChange={onChangeName}
            onKeyDown={onKeydownName}
            value={this.state.currentGraph}>
        </Input>
      </div>
    )
  }
}
