const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given trace structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} traceStruct - Trace node to process
  */
class Trace {
  constructor(options, traceStruct) {
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
      * Port property default
      * @type {Number}
      */
    this.port = -1;

    /**
      * Portocol property default
      * @type {String}
      */
    this.proto = '';

    /**
      * Hop property default
      * @type {Array}
      */
    this.hopArray = [];

    // Attempt parsing or fail with error
    try {
      this.parseStruct(traceStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing trace data: ${err}`);
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
    * Returns the trace meta as an object
    * @type {Object}
    * @readonly
    */
  get meta() {
    return {
      port: this.port,
      proto: this.proto,
    };
  }

  /**
    * Returns all processed data, including child data, of the this class
    * @type {Object}
    * @readonly
    */
  get data() {
    return {
      meta: this.meta,
      hops: this.hop,
    };
  }

  /**
    * Returns the current hop array, allowing recursion to continue
    * @type {Array}
    * @readonly
    */
  get hop() {
    return this.hopArray;
  }

  /**
    * Calls the addHop function to update the hop array, looping if needed
    * @param {Array||String} hopStruct - Current `hop` node
    */
  set hop(hopStruct) {
    if (Array.isArray(hopStruct)) {
      for (let i = 0, j = hopStruct.length; i < j; i += 1) {
        this.addHop(hopStruct[i]);
      }
    } else {
      this.addHop(hopStruct);
    }
  }

  /**
    * Updates the hopArray, storing the new hop details
    * @param {Object} struct - Current `hop` node
    */
  addHop(struct) {
    if (struct.attrib) {
      this.hopArray.push(Util.mergeDefault({
        ttl: -1,
        ipaddr: '',
        rtt: -1,
        host: '',
      },
      struct.attrib));
    }
  }
}

module.exports = Trace;
