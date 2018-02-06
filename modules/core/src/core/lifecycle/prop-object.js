import {LIFECYCLE} from './constants';
import {createProps} from './create-props';
import {diffProps} from './props';
import assert from '../utils/assert';

export default class PropsObject {
  constructor(/* ...propObjects */) {
    // Merge supplied props with default props and freeze them.
    /* eslint-disable prefer-spread */
    this.props = createProps.apply(this, arguments);
    /* eslint-enable prefer-spread */

    this.id = this.props.id; // The id, used for matching with objects from last cycle
    this.lifecycle = LIFECYCLE.NO_STATE; // Helps track and debug the life cycle of objects
    this.internalState = null;

  }

  // clone this layer with modified props
  clone(newProps) {
    return new this.constructor(Object.assign({}, this.props, newProps));
  }

  // Returns the most recent layer that matched to this state
  // (When reacting to an async event, this layer may no longer be the latest)
  getCurrentObject() {
    return this.internalState && this.internalState.object;
  }

  // PROTECTED MENTHODS

 _initState() {
    assert(!this.internalState && !this.state);

    // Ensure any async props are updated
    this._updateAsyncProps(this.props);
  }

  // Called by layer manager to transfer state from an old layer
  _transferState(oldObject) {
    const {internalState, props} = oldObject;
    // assert(state && internalState);

    internalState.oldProps = props;

    if (this === oldObject) {
      return;
    }

    // Move state
    this.internalState = internalState;
    // Note: We keep the state ref on old layers to support async actions
    // oldLayer.state = null;

    // Keep a temporary ref to the old props, for prop comparison
    this.oldProps = props;

    // Ensure any async props are updated
    this._updateAsyncProps(this.props);

    // Update model layer reference
    for (const model of this.getModels()) {
      model.userData.layer = this;
    }

    this.diffProps(this.props, props);
  }

  // Ensure any async props are updated
  _updateAsyncProps() {
    this.internalState.updateAsyncProps(this.props);
  }

  // Compares the layers props with old props from a matched older layer
  // and extracts change flags that describe what has change so that state
  // can be update correctly with minimal effort
  // TODO - arguments for testing only
  _diffProps(newProps, oldProps) {
    const changeFlags = diffProps(newProps, oldProps);

    // iterate over changedTriggers
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this._onUpdateTriggerFired(key);
        }
      }
    }

    return this.setChangeFlags(changeFlags);
  }

  // Operate on each changed triggers, will be called when an updateTrigger changes
  _onUpdateTriggerFired(propName) {
    this.invalidateAttribute(propName);
  }
}
