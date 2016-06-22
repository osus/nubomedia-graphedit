import React from 'react';

import {Button, Collapse, Well} from 'react-bootstrap';

export default class ValidatorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false, nodes: {}
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.validator != null) {
      this.setState({error: nextProps.validator.error, nodes: nextProps.validator.nodes});
      $("#taskgenerate").prop('disabled', nextProps.validator.error);
    }
  }
  render() {
    let nodes = this.state.nodes || {};
    let errorFields = Object.keys(nodes).map(
      (key) => {
        let node       = nodes[key];
        let title      = <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>;
        // Properties
        let errorsPropertiesTitle = <h5>Properties errors:</h5>;
        let errorsProperties = node.errors.properties.map(
          (error) => {
            return <li key={error.property}>{error.property}: {error.description}</li>
          });

        // Connections Sources & Targets
        let errorsConnectionsTitle = <h5>Connections errors:</h5>;
        let errorsConnectionsSources = node.errors.connections.sources.map(
          (error) => {
            return <li key={error.property}>{error.property}: {error.description}</li>
          });
        let errorsConnectionsTargets = node.errors.connections.targets.map(
          (error) => {
            return <li key={error.property}>{error.property}: {error.description}</li>
          });

        return (
          <div className="error" key={key}>
            {title}
            {errorsProperties.length > 0 ? errorsPropertiesTitle : ''}
            <ul>
              {errorsProperties}
            </ul>
            {errorsConnectionsSources.length > 0 || errorsConnectionsTargets.length ? errorsConnectionsTitle : ''}
            <ul>
              {errorsConnectionsSources}
              {errorsConnectionsTargets}
            </ul>
          </div>);
      });

    let badgeNotification = null;
    if (this.props.editor.name) {
      badgeNotification =
        <span className={errorFields.length > 0 ? 'badge notify' : 'badge notify notify-ok'}>
          {errorFields.length > 0 ? errorFields.length : '√'}
        </span>
    }
    return (
      <div className="col-sx-12 navbar-fixed-bottom">
        <Button className="btn-validator" onClick={this.props.toggleValidatorPanel} disabled={!this.props.editor.name || !this.state.error}>
          {!this.props.showValidatorPanel ? 'Open Validator' : 'Close Validator'}
        </Button>
        {badgeNotification}
        <Collapse in={this.props.showValidatorPanel}>
          <div id="validator-panel" className="validator-panel">
            <Well>
              {errorFields}
            </Well>
          </div>
        </Collapse>
      </div>
    )
  }
}