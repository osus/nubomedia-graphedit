import React from 'react';
import { connect } from 'react-redux';

import NodeModal from './NodeModal';

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showNodeModal: false, node: null};
  }
  closeNodeModal() {
    this.setState({ showNodeModal: false, node: null }); // TODO: ensure this won't leave leaks
  }

  nodeClickHandler(editor, node) {
    this.setState({ showNodeModal: true, node: node });
  }
  render() {
    let nodemodal = null;
    if (this.state.showNodeModal) {
      nodemodal = <NodeModal node={this.state.node} nodedefs={this.props.nodedefs} closeNodeModal={this.closeNodeModal.bind(this)} />;
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
