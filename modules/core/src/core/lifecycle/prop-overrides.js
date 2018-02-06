export default class PropOverrides {
  constructor() {
    this._propOverrides = {}; // Prop values that the app sees
  }

  hasProp(propName) {
    return propName in this._propOverrides;
  }

  // Returns value of an overridden prop
  getProp(propName) {
    return propName in this._propOverrides ? this._propOverrides[propName].value : undefined;
  }

  bumpLoadCount(propName) {
    const propOverride = this._propOverrides[propName];
    if (propOverride) {
      propOverride.loadCounter++;
      return propOverride.loadCounter;
    }
    return 0;
  }

  // Create a new override if not already in place
  addProp(propName, initialValue) {
    if (!this._propOverrides[propName]) {
      this._propOverrides[propName] = {
        value: initialValue,
        originalValue: null, // Auto loaded data is stored here
        lastOriginalValue: null, // Original value is stored here
        loadCounter: 0,
        storeCounter: 0
      };
    }
    return this._propOverrides[propName];
  }

  setOriginalProp(propName, value) {
    const propOverride = this._propOverrides[propName];
    if (value === propOverride.lastOriginalValue) {
      return false;
    }
    propOverride.lastOriginalValue = propOverride.value;
    propOverride.value = value;
    return true;
  }

  setResolvedProp(propName, value, loadCounter) {
    const propOverride = this._propOverrides[propName];
    // Only update if loadCounter bigger or equal to store counter
    loadCounter = loadCounter || propOverride.loadCounter;
    if (propOverride.storeCounter <= loadCounter) {
      propOverride.storeCounter = loadCounter;
      propOverride.value = value;
    }
  }
}
