const Util = require('../../utility/Util');
const PortData = require('./PortData');

/**
  * Processes and stores the values and meta data of a given port array structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} portsStruct - Ports node to process
  */
class Ports {
  constructor(options, portsStruct) {
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
      * Holds port meta data
      * @type {Array}
      */
    this.meta = [];

    /**
      * Holds PortData children
      * @type {Array}
      */
    this.portArray = [];

    // Attempt parsing or fail with error
    try {
      this.parseStruct(portsStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing port data: ${err}`);
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
      meta: this.meta,
      portArray: this.portArray.map((p) => p.data || {}),
    };
  }

  /**
    * Provides default `extraports` property to ensure node processing, always returns
    * current meta values
    * @type {Object}
    * @readonly
    */
  get extraports() {
    return this.meta;
  }

  /**
    * Loops through the `extraports` node and continues processing
    * @param {Object} ports - Current `extraports` node
    */
  set extraports(ports) {
    if (Array.isArray(ports)) {
      for (let i = 0, j = ports.length; i < j; i += 1) {
        this.addPortMeta(ports[i]);
      }
    } else {
      this.addPortMeta(ports);
    }
  }

  /**
    * Stores the port meta data by type
    * @param {Object} portMeta - Target port meta
    */
  addPortMeta(portMeta) {
    if (typeof portMeta.attrib !== 'undefined') {
      this.meta.push(Util.mergeDefault({
        state: '',
        count: -1,
        reason: '',
      },

      portMeta.attrib));
    }

    if (typeof portMeta.extrareasons !== 'undefined') {
      this.meta[this.meta.length - 1].reason = portMeta.extrareasons.attrib.reason;
    }
  }

  /**
    * Provides default `port` property to ensure node processing, always returns
    * current port array values
    * @type {Array}
    * @readonly
    */
  get port() {
    return this.portArray;
  }

  /**
    * Continues node walking recursion through the current port node, creating
    * child classes as needed
    * @param {Object} portStruct - Current `port` node
    */
  set port(portStruct) {
    if (Array.isArray(portStruct)) {
      for (let i = 0, j = portStruct.length; i < j; i += 1) {
        this.portArray.push(new PortData(this.options, portStruct[i]));
      }
    } else {
      this.portArray.push(new PortData(this.options, portStruct));
    }
  }
}

module.exports = Ports;
