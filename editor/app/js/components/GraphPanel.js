import React from 'react';
import { connect } from 'react-redux';

import NodeModal from './NodeModal';

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showNodeModal: false, showProjectModal: false, node: null};
    this.initialNode = null;
  }
  closeNodeModal() {
    Object.keys(this.initialNode.props).map(
      (key) => {
        let p = this.initialNode.props[key];
        this.state.node.properties[key] = p;
      });
    this.setState({ showNodeModal: false, node: null }); // TODO: ensure this won't leave leaks
  }
  nodeClickHandler(editor, node) {
    this.setState({ showNodeModal: true, node: node});
    this.initialNode = React.cloneElement(node, node.properties);
  }
  onDeleteNode() {
    this.props.onDeleteNode(this.state.node);
    this.setState({ showNodeModal: false, node: null }); // TODO: ensure this won't leave leaks
  }
  onSavePropsNode() {
    this.setState({showNodeModal: false, node: null}); // TODO: ensure this won't leave leaks
  }
  onChangeNodeProp(e) {
    this.state.node.properties[e.target.name] = e.target.value;
    this.setState({node: this.state.node});
  }
  render() {
    let nodemodal = null;
    if (this.state.showNodeModal) {
      nodemodal =
        <NodeModal
          node={this.state.node}
          nodedefs={this.props.nodedefs}
          onDeleteNode={this.onDeleteNode.bind(this)}
          closeNodeModal={this.closeNodeModal.bind(this)}
          onSavePropsNode={this.onSavePropsNode.bind(this)}
          onChangeNodeProp={this.onChangeNodeProp.bind(this)}
        />;
    }
    return (
      <div id="graphpanel" className="panel panel-default" style={{height:"600px",width:"100%"}}>
        <div className="demo nuboged" ref="editor_panel" id="nuboged-container" >
        </div>
        {nodemodal}
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
