const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given distance structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} distanceStruct - Distance node to process
  */
class Distance {
  constructor(options, distanceStruct) {
    /**
      * Merge default options with given options
      * @type {Object}
      */
    this.options = Util.mergeDefault({
      onError: () => {}, // @type {Function}
      onWarning: () => {}, // @type {Function}
      onDebug: () => {}, // @type {Function}
    }, options);

    /**
      * Distance value property default
      * @type {Number}
      */
    this.value = -1;

    // Attempt parsing or fail with error
    try {
      this.parseStruct(distanceStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing distance data: ${err}`);
    }
  }

  /**
    * Recursive parsing function, sets the value of this classes properties (if
    * it exists), or calls the proper processing function, or builds required
    * child classes for further processing
    * @param {Object} curStruct - Current node being processed
    */
  parseStruct(curStruct) {
    const props = Object.keys(curStruct);

    for (let i = 0, j = props.length; i < j; i += 1) {
      if (typeof this[props[i]] === 'undefined') {
        this.options.onDebug(`${this.constructor.name} Class:
          Unknown property in structure: ${props[i]}`);
      } else {
        this[props[i]] = curStruct[props[i]];
      }
    }
  }

  /**
    * Provides default `attrib` property to ensure node processing, always returns
    * current meta values
    * @type {Object}
    * @readonly
    */
  get attrib() {
    return this.data;
  }

  /**
    * Continues node walking recursion through the current attrib node
    * @param {Object} meta - Current `attrib` node
    */
  set attrib(meta) {
    this.parseStruct(meta);
  }

  /**
    * Returns all processed data, including child data, of the this class
    * @type {Number}
    * @readonly
    */
  get data() {
    return this.value;
  }
}

module.exports = Distance;
