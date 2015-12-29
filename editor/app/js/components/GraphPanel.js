import React from 'react';
import { connect } from 'react-redux';

export default class GraphPanel extends React.Component {
  render() {
    return (
      <div id="graphpanel" className="panel panel-default" style={{height:"600px",width:"100%"}}>
        <div className="demo nuboged" ref="editor_panel" id="nuboged-container" >
        </div>
      </div>
    );
  }
  // Can't use callback ref because a dynamic callback (needed to use 'this') gets fired every update
  componentDidMount() {
    this.props.onSetEditorPanel(this.refs.editor_panel);
  }
  componentWillUnmount() {
    this.props.onSetEditorPanel(null);
  }
}
