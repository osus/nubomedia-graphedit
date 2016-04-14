import React from 'react';

import { Modal, Button, Input } from 'react-bootstrap';

export default class NodeModal extends React.Component {
  render() {
    let def = this.props.nodedefs.defs[this.props.node.type];
    let properties = def.properties || {};
    let modalFields = Object.keys(properties).map(
      (key) => {
        let p = properties[key];
        let name = p.nativeName || key;
        let type = 'text';
        let inputChildren = null;
        if (Array.isArray(p.type)) {
          type = 'select';
          inputChildren = Object.keys(p.type).map(
            (key) => {
              let opt = p.type[key];
              return <option value={opt.value || opt} key={key}>{opt.name || opt}</option>
          });
        }
        else if (typeof p.type == 'object') {
          type = 'select';
          inputChildren = Object.keys(p.type).map(
            (key) => {
              let opt = p.type[key];
              return <option value={key} key={key}>{p.type[key]}</option>
          });
        }
        return (<div className="form-horizontal" key={key}>
          <Input type={type}
              name={key}
              ref={"input_box_"+key}
              label={name+": "}
              labelClassName="col-xs-3" wrapperClassName="col-xs-9"
              onChange={this.props.onChangeNodeProp}
              value={this.props.node.properties[key]}>
              {inputChildren}
          </Input>
        </div>);
    });
    return (
      <Modal show={true} onHide={this.props.closeNodeModal} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>{this.props.node.type} Node: {this.props.currentNodeName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Node:</h4>
          <div className="form-horizontal">
            <Input type="text"
                   name="nodeName"
                   label="Name: "
                   labelClassName="col-xs-3" wrapperClassName="col-xs-9"
                   onChange={this.props.onChangeNodeName}
                   value={this.props.currentNodeName}>
            </Input>
          </div>
          <h4>Properties:</h4>
          {modalFields}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onDeleteNode} bsStyle="danger" style={{float:"left"}}>Delete Node</Button>
          <Button onClick={this.props.closeNodeModal}>Close</Button>
          <Button onClick={this.props.onSavePropsNode} bsStyle="primary">Save Changes</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

