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
    }
  }
  render() {
    let nodes = this.state.nodes || {};
    let errorFields = Object.keys(nodes).map(
      (key) => {
        let node       = nodes[key];
        let title      = <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>;
        let errors     = node.errors.map(
          (error) => {
            return <li key={key}>{error.property}: {error.description}</li>
          });
        return (
          <div className="error" key={key}>
            {title}
            <ul>
              {errors}
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
          <div className="validator-panel">
            <Well>
              {errorFields}
            </Well>
          </div>
        </Collapse>
      </div>
    )
  }
}