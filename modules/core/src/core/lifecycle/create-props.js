import {applyPropOverrides} from '../lib/seer-integration';
import log from '../utils/log';
import {parsePropTypes} from './prop-types';

// Create a property object
export function createProps() {
  const layer = this; // eslint-disable-line

  // Get default prop object (a prototype chain for now)
  const {defaultProps} = getPropDefs(layer.constructor);

  // Create a new prop object with  default props object in prototype chain
  const newProps = Object.create(defaultProps, {
    // Props need a back pointer to the owning layer
    _layer: {
      enumerable: false,
      value: layer
    },
    // The supplied (original) values for those async props that are set to url strings or Promises.
    // In this case, the actual (i.e. resolved) values are looked up from layer.internalState
    _asyncPropUrls: {
      enumerable: false,
      value: {}
    },
    // Note: the actual (i.e. resolved) values for props that are NOT set to urls or Promises.
    // in this case the values are served directly from this map
    _asyncPropValues: {
      enumerable: false,
      value: {}
    }
  });

  // "Copy" all sync props
  for (let i = 0; i < arguments.length; ++i) {
    Object.assign(newProps, arguments[i]);
  }

  // SEER: Apply any overrides from the seer debug extension if it is active
  applyPropOverrides(newProps);

  // Props must be immutable
  Object.freeze(newProps);

  return newProps;
}

// Helper methods

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop) && object[prop];
}

function getLayerName(layerClass) {
  const layerName = getOwnProperty(layerClass, 'layerName');
  if (!layerName) {
    log.once(0, `${layerClass.name}.layerName not specified`);
  }
  return layerName || layerClass.name;
}

// Return precalculated defaultProps and propType objects if available
// build them if needed
function getPropDefs(layerClass) {
  const props = getOwnProperty(layerClass, '_mergedDefaultProps');
  if (props) {
    return {
      defaultProps: props,
      propTypes: getOwnProperty(layerClass, '_propTypes')
    };
  }

  return buildPropDefs(layerClass);
}

// Build defaultProps and propType objects by walking layer prototype chain
function buildPropDefs(layerClass) {
  const parent = layerClass.prototype;
  if (!parent) {
    return {
      defaultProps: {}
    };
  }

  const parentClass = Object.getPrototypeOf(layerClass);
  const parentPropDefs = (parent && getPropDefs(parentClass)) || null;

  // Parse propTypes from Layer.defaultProps
  const layerDefaultProps = getOwnProperty(layerClass, 'defaultProps') || {};
  const layerPropDefs = parsePropTypes(layerDefaultProps);

  // Create a merged type object
  const propTypes = Object.assign(
    {},
    parentPropDefs && parentPropDefs.propTypes,
    layerPropDefs.propTypes
  );

  // Create any necessary property descriptors and create the default prop object
  // Assign merged default props
  const defaultProps = buildDefaultPropsObject(
    layerPropDefs.defaultProps,
    parentPropDefs && parentPropDefs.defaultProps,
    propTypes,
    layerClass
  );

  // Store the precalculated props
  layerClass._mergedDefaultProps = defaultProps;
  layerClass._propTypes = propTypes;

  return {propTypes, defaultProps};
}

// Builds a pre-merged default props object that layer props can inherit from
function buildDefaultPropsObject(props, parentProps, propTypes, layerClass) {
  const defaultProps = Object.create(null);

  Object.assign(defaultProps, parentProps, props);

  // Avoid freezing `id` prop
  const id = getLayerName(layerClass);
  delete props.id;

  // Add getters/setters for async prop properties
  Object.defineProperties(defaultProps, {
    id: {
      configurable: false,
      writable: true,
      value: id
    }
  });

  // Add getters/setters for async prop properties
  addAsyncPropDescriptors(defaultProps, propTypes);

  return defaultProps;
}

// Create descriptors for overridable props
function addAsyncPropDescriptors(defaultProps, propTypes) {
  const defaultValues = {};

  const descriptors = {
    // Default "resolved" values for async props, returned if value not yet resolved/set.
    _asyncPropDefaultValues: {
      enumerable: false,
      value: defaultValues
    },
    // TODO - Shadowed object, just to allow indexing
    _asyncPropUrls: {
      enumerable: false,
      value: {}
    }
  };

  // Move async props into shadow values
  for (const propType of Object.values(propTypes)) {
    const {name, value} = propType;
    if (propType.async) {
      defaultValues[propType.name] = value;
      Object.assign(descriptors, {
        [name]: getDescriptorForAsyncProp(name, value)
      });
    }
  }

  Object.defineProperties(defaultProps, descriptors);
}

// Helper: Configures getter and setter for one async prop
function getDescriptorForAsyncProp(name) {
  return {
    configurable: false,
    // Save the provided value for async props in a special map
    set(newValue) {
      if (typeof newValue === 'string' || newValue instanceof Promise) {
        this._asyncPropUrls[name] = newValue;
      } else {
        this._asyncPropValues[name] = newValue;
      }
    },
    // Only the layer's state knows the true value of async prop
    get() {
      if (this._asyncPropValues) {
        // Prop value isn't async, so just return it
        if (name in this._asyncPropValues) {
          const value = this._asyncPropValues[name];
          // TODO - data expects null to be replaced with `[]`
          return value ? value : this._asyncPropDefaultValues[name];
        }
        // It's an async prop value: look into layer state
        // TODO - will be uncommented in next PR
        // const state = this._layer && this._layer.internalState;
        // if (state && state.hasAsyncProp(name)) {
        //   return state.getAsyncProp(name);
        // }
      }
      // layer not yet initialized/matched, return the layer's default value for the prop
      return this._asyncPropDefaultValues[name];
    }
  };
}
