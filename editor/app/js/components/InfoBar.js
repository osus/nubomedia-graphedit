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
      <div className="col-xs-6">
        <h4>{this.state.projectName ? this.state.projectName : 'NuboEditor'}</h4>
      </div>
    )
  }
}
