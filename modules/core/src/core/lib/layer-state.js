import PropOverrides from '../lifecycle/prop-overrides';
import assert from '../utils/assert';

export default class LayerState {

  constructor({attributeManager, layer}) {
    assert(attributeManager && layer);
    this.layer = layer;
    this.attributeManager = attributeManager;
    this.model = null;
    this.needsRedraw = true;
    this.subLayers = null; // reference to sublayers rendered in a previous cycle
    this.asyncProps = new PropOverrides();
  }

  //
  // ASYNC PROP HANDLING
  //

  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  updateAsyncProps() {
    const {props} = this.layer;
    for (const propName in props._asyncPropValues) {
      this.asyncProps.addProp(propName, props._asyncPropValues[propName]);
      const value = props._asyncPropValues[propName];
      this.setAsyncProp(propName, value);
    }
  }

  hasAsyncProp(propName, value) {
    return this.asyncProps.hasProp(propName);
  }

  getAsyncProp(propName, value) {
    return this.asyncProps.getProp(propName);
  }

  // Intercept strings (URLs) and activates loading and prop rewriting
  setAsyncProp(propName, value) {
    if (value instanceof Promise) {
      const promise = value;
      if (this.asyncProps.setOriginalProp(propName, promise)) {
        this._loadPromise(propName, promise);
      }
    }

    // interpret value string as url and start a new load
    if (typeof value === 'string') {
      const url = value;
      if (this.asyncProps.setOriginalProp(propName, url)) {
        const {fetch} = this.layer.props;
        const promise = fetch(url);
        this._loadPromise(propName, promise);
      }
    }

    // else, normal, non-async value. No override needed
    if (this.asyncProps.setOriginalProp(propName, value)) {
      this.asyncProps.setResolvedProp(propName, value);
    }
  }

  _loadPromise(propName, promise) {
    // Give the app a chance to post process the data

    const loadCount = this.asyncProps.bumpLoadCount();
    promise
      .then(data => {
        // Lets app transform loaded data
        const {dataTransform} = this.layer.props;
        data = dataTransform ? dataTransform(data) : data;

        // Update the loaded data
        if (this.asyncProps.setResolvedProp(propName, data, loadCount)) {
          this.layer.setChangeFlags({dataChanged: true});
        }
      });

    return true;
  }
}
