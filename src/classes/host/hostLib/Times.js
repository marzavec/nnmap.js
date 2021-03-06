const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given times structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} timesStruct - Times node to process
  */
class Times {
  constructor(options, timesStruct) {
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
      * Srtt property default
      * @type {Number}
      */
    this.srtt = -1;

    /**
      * Rttvar property default
      * @type {Number}
      */
    this.rttvar = -1;

    /**
      * TO property default
      * @type {Number}
      */
    this.to = -1;

    // Attempt parsing or fail with error
    try {
      this.parseStruct(timesStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing timing data: ${err}`);
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
    * @type {Object}
    * @readonly
    */
  get data() {
    return {
      srtt: this.srtt,
      rttvar: this.rttvar,
      to: this.to,
    };
  }
}

module.exports = Times;
