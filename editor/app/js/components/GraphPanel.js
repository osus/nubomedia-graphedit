import React from 'react';
import { connect } from 'react-redux';

import ProjectModal from './ProjectModal';
import NodeModal from './NodeModal';

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showNodeModal: false, showProjectModal: false, node: null};
    this.initialNode = null;
  }

  // Project
  closeProjectModal() {
    this.setState({showProjectModal: false});
  }
  projectClickHandler() {
    this.setState({showProjectModal: true});
  }
  setProjectProperties(projectName, packageName, graphName) {
    this.setState({showProjectModal: false});
    this.props.setProjectProperties(projectName, packageName, graphName);
  }

  // Node
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
    this.setState({showNodeModal: false, node: null}); // TODO: ensure this won't leave leaks
  }
  onSavePropsNode() {
    this.setState({showNodeModal: false, node: null}); // TODO: ensure this won't leave leaks
  }
  onChangeNodeProp(e) {
    this.state.node.properties[e.target.name] = e.target.value;
    this.setState({node: this.state.node});
  }

  render() {
    let projectmodal = null;
    let nodemodal    = null;
    if (this.state.showProjectModal) {
      projectmodal =
        <ProjectModal editor={this.props.editor}
          closeProjectModal={this.closeProjectModal.bind(this)}
          setProjectProperties={this.setProjectProperties.bind(this)}
        />
    }
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
        {projectmodal}
        {nodemodal}
      </div>
    );
  }
  // Can't use callback ref because a dynamic callback (needed to use 'this') gets fired every update
  componentDidMount() {
    this.props.onSetEditorPanel(this.refs.editor_panel, this.projectClickHandler.bind(this), this.nodeClickHandler.bind(this));
  }
  componentWillUnmount() {
    this.props.onSetEditorPanel(null);
  }
}
