import React from 'react';
import { connect } from 'react-redux';

import { Modal, Button } from 'react-bootstrap';

const NullNode = {
  element: null,
  type: "",
  name: ""
}

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showNodeModal: false, node: NullNode};
  }
  closeNodeModal() {
    this.setState({ showNodeModal: false/*, node: NullNode*/ }); // TODO: ensure this won't leave leaks
  }

  nodeClickHandler(editor, node) {
    this.setState({ showNodeModal: true, node: node });
  }
  render() {
    return (
      <div id="graphpanel" className="panel panel-default" style={{height:"600px",width:"100%"}}>
        <div className="demo nuboged" ref="editor_panel" id="nuboged-container" >
        </div>
        <Modal show={this.state.showNodeModal} onHide={this.closeNodeModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Node properties</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>{this.state.node.type}</h4>
            <Button bsStyle="danger">Delete</Button>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
  // Can't use callback ref because a dynamic callback (needed to use 'this') gets fired every update
  componentDidMount() {
    this.props.onSetEditorPanel(this.refs.editor_panel, this.nodeClickHandler.bind(this));
  }
  componentWillUnmount() {
    this.props.onSetEditorPanel(null);
  }
}
