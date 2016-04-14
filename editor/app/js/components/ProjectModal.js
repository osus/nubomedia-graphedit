import React from 'react';
import { connect } from 'react-redux';

import { Modal, Button, Input } from 'react-bootstrap';

export default class ProjectModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showProjectBody: true, showGraphBody: false,
      projectName: this.props.editor.name, packageName: this.props.editor.package, graphName: this.props.editor.currentGraph};
  }
  onProjectNext() {
    this.setState({showProjectBody: false, showGraphBody: true});
  }
  onGraphBack() {
    this.setState({showProjectBody: true, showGraphBody: false});
  }
  onSave() {
    this.setState({showProjectBody: true, showGraphBody: false});
    this.props.setProjectProperties(this.state.projectName, this.state.packageName, this.state.graphName);
  }
  onEdit() {
    this.setState({showProjectBody: true, showGraphBody: false});
    this.props.setProjectProperties(this.state.projectName, this.state.packageName, this.state.graphName);
  }
  render() {
    let onChangeProjectName = (e) => {
      this.setState({projectName: e.target.value})
    };
    let onChangePackageName = (e) => {
      this.setState({packageName: e.target.value})
    };
    let onChangeGraphName = (e) => {
      this.setState({graphName: e.target.value})
    };

    let modalTitle    = (!this.props.projectEdit) ? "Create project" : "Edit project";
    let projectbody   = null;
    let projectfooter = null;
    let graphbody     = null;
    let graphfooter   = null;

    if (this.state.showProjectBody) {
      projectbody =
        <Modal.Body>
          <div className="form-horizontal">
            <Input type="text"
                   name="project_name"
                   label="Project name: "
                   labelClassName="col-xs-3"
                   wrapperClassName="col-xs-9"
                   onChange={onChangeProjectName}
                   value={this.state.projectName}
                   autoFocus={true}/>
          </div>
          <div className="form-horizontal">
            <Input type="text"
                   name="package_name"
                   label="Package name: "
                   labelClassName="col-xs-3"
                   wrapperClassName="col-xs-9"
                   onChange={onChangePackageName}
                   value={this.state.packageName}/>
          </div>
        </Modal.Body>;
      if (!this.props.projectEdit) {
        projectfooter =
          <Modal.Footer>
            <Button onClick={this.props.closeProjectModal}>Close</Button>
            <Button onClick={() => this.onProjectNext()} bsStyle="primary">Next</Button>
          </Modal.Footer>;
      } else {
        projectfooter =
          <Modal.Footer>
            <Button onClick={this.props.closeProjectModal}>Close</Button>
            <Button onClick={() => this.onEdit()} bsStyle="primary">Save</Button>
          </Modal.Footer>;
      }
    }
    if (this.state.showGraphBody) {
      graphbody =
        <Modal.Body>
          <div className="form-horizontal">
            <Input type="text"
                   name="graph_name"
                   label="Graph name: "
                   labelClassName="col-xs-3"
                   wrapperClassName="col-xs-9"
                   onChange={onChangeGraphName}
                   value={this.state.graphName}
                   autoFocus={true}/>
          </div>
        </Modal.Body>;
      graphfooter =
        <Modal.Footer>
          <Button onClick={this.props.closeProjectModal}>Close</Button>
          <Button onClick={() => this.onGraphBack()} bsStyle="danger">Back</Button>
          <Button onClick={() => this.onSave()} bsStyle="primary">Create</Button>
        </Modal.Footer>;
    }

    return (
      <Modal show={true} onHide={this.props.closeProjectModal} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        {projectbody}
        {projectfooter}
        {graphbody}
        {graphfooter}
      </Modal>
    );
  }
}