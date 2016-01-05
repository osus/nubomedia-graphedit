import React from 'react';
import { connect } from 'react-redux';

import { Modal, Button, Input } from 'react-bootstrap';

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
    let modalFields = []
    if (this.state.showNodeModal) {
      let def = this.props.nodedefs.defs[this.state.node.type];
      let properties = def.properties || {};
      modalFields = Object.keys(properties).map(
        (key) => {
          let p = properties[key];
          let name = p.nativeName || key;
          return (<div className="form-horizontal" key={key}>
            <Input type='text'
                ref={"input_box_"+key}
                label={name+": "}
                labelClassName="col-xs-3" wrapperClassName="col-xs-9"
//                onChange={onChangeName}
//                onKeyDown={onKeydownName}
                value={this.state.node.properties[key]}>
            </Input>
          </div>);
      });
    }
    return (
      <div id="graphpanel" className="panel panel-default" style={{height:"600px",width:"100%"}}>
        <div className="demo nuboged" ref="editor_panel" id="nuboged-container" >
        </div>
        <Modal show={this.state.showNodeModal} onHide={this.closeNodeModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.node.type} Node: {this.state.node.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button bsStyle="danger">Delete</Button>
            <h4>Properties:</h4>
            {modalFields}
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
