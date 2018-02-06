import PropOverrides from '../lifecycle/prop-overrides';

export default class PropObjectState {

  constructor() {
    this.object = null;
    this.asyncProps = new PropOverrides();
  }

  // ASYNC PROP HANDLING
  //

  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  //
  updateProps() {
    for (const propName in this.object.props.getAsyncProps()) {
      this._setAsyncProp(propName);
    }
  }

  getPropOverride(propName, value) {
    this.propOverrides.get(propName);
    const propOverride = this.asyncProps[propName];
    if (value === propOverride.lastValue) {
      return null;
    }
    propOverride.lastValue = value;
    return propOverride;
  }

  // PRIVATE METHODS

  // Intercept strings (URLs) and activates loading and prop rewriting
  //
  _setAsyncProp(propName) {
    const value = this.layer.props._getOriginalValue(propName);

    if (value instanceof Promise) {
      return this._loadPromiseProp(propName, value)
    }

    if (typeof value === 'string') {
      return this._loadUrlProp(propName, value);
    }

    // else, normal, non-async value. No override needed
    this.asyncProps.remove(propName);
    return false;
  }

  _loadPromiseProp(propName, promise) {
    const propOverride = this._getPropOverride(propName, promise);
    if (!propOverride) {
      return false;
    }

    // interpret value string as url and start a new load
    this._watchPromise(propOverride, promise);
    return true;
  }

  _loadUrlProp(propName, url) {
    const propOverride = this._getPropOverride(propName, url);
    if (!propOverride) {
      return false;
    }

    // interpret value string as url and start a new load
    const {fetch} = this.layer.props;
    const promise = fetch(url);
    this._watchPromise(propOverride, promise);
    return true;
  }

  _watchPromise(propOverride, promise) {
    // Give the app a chance to post process the data
    const {dataTransform} = this.layer.props;

    const loadCount = propOverride.loadCount;
    promise
      .then(data => dataTransform ? dataTransform(data) : data)
      .then(data => {
        if (propOverride.set(loadCount, data)) {
          this.layer.setChangeFlags({dataChanged: true});
        }
      });

    return true;
  }

  // Starts loading for an async prop override
  // _loadAsyncProp({url, propOverride, fetch, dataTransform}) {
  //   // Closure will track counter to make sure we only update on last load
  //   const loadCount = propOverride.loadCount;

  //   // Load the data
  //   propOverride.loadPromise =
  //     // Give the app a chance to post process the data
  //     .then(data => dataTransform(data))
  //     .then(data => {
  //       // If multiple loads are pending, only update when last issued load completes
  //       if (propOverride.set(loadCount, data)) {
  //         this.layer.setChangeFlags({dataChanged: true});
  //       }
  //     });
  // }
}
