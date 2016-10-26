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
import { connect } from 'react-redux';

import { Modal, Button, Input, ProgressBar } from 'react-bootstrap';

export default class GenerateCodeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showStepOne: true,
      showStepTwo: false,
      showError: false,
      res: {}
    }
  }
  componentDidMount() {
    this.setState({showStepOne: true, showStepTwo: false, showError: false});
    let url = "http://" + window.location.hostname + ":3000";
    let response = function(data, status) {
      if (status == "success") {
        this.setState({showStepOne: false, showStepTwo: true, showError: false});
        this.setState({res: {status: status, data: data.data}});

        var element = document.createElement('a');
        element.setAttribute('href', data.data);
        element.style.display = 'none';
        document.body.appendChild(element);
        setTimeout(() => {
          element.click();
          document.body.removeChild(element);
        }, 2000)
      } else {
        this.setState({res: {status: data.status, data: JSON.parse(data.responseText).data}});
        this.setState({showStepOne: false, showStepTwo: false, showError: true});
      }
    }.bind(this);
    let reqCfg = {
      type: "POST",
      url: url,
      data: this.props.project,
      success: response,
      error: response
    };
    $.ajax(reqCfg);
  }
  render() {
    let stepOne = null;
    let stepTwo = null;
    let error = null;
    if (this.state.showStepOne) {
      stepOne = <div>
        <h3 className="text-center">Generating code...</h3>
        <ProgressBar active now={100} />
      </div>;
    }
    if (this.state.showStepTwo) {
      stepTwo = <div>
        <h3 className="text-center">Success!</h3>
        <h4 className="text-center">
          If the project does not download automatically, click this <a href={this.state.res.data} target="_blank" onClick={this.props.closeGenerateCodeModal}>link</a>
        </h4>
      </div>
    }
    if (this.state.showError) {
      error = <div>
        <h3 className="text-center">Ups... We have an error:</h3>
        <ul>
          <li>Status: {this.state.res.status}</li>
          <li>Response: </li>
        </ul>
        <pre>{this.state.res.data}</pre>
        <div className="text-center">
          <a onClick={this.componentDidMount.bind(this)} className="btn btn-primary text-center">Try again</a>
        </div>
      </div>
    }
    return (
      <Modal show={true} onHide={this.props.closeGenerateCodeModal} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>Generate Project Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {stepOne}
          {stepTwo}
          {error}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.closeGenerateCodeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}