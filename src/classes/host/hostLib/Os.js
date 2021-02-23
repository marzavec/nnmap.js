const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given os structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} osStruct - Os node to process
  */
class Os {
  constructor(options, osStruct) {
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
      * Checked ports property default
      * @type {Array}
      */
    this.portsUsed = [];

    /**
      * OS Matches property default
      * @type {Array}
      */
    this.osMatchs = [];

    // Attempt parsing or fail with error
    try {
      this.parseStruct(osStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing host os data: ${err}`);
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
      portsUsed: this.portsUsed, // @type {Array}
      osMatchs: this.osMatchs, // @type {Array}
      match: this.match, // @type {String}
    };
  }

  /**
    * Provides default `portsUsed` property to ensure node processing, always returns
    * current portsUsed values
    * @type {Array}
    * @readonly
    */
  get portused() {
    return this.portsUsed;
  }

  /**
    * Adds any ports used to the `portsUsed` array
    * @param {Array} ports - Current `portsused` node
    */
  set portused(ports) {
    if (Array.isArray(ports)) {
      for (let i = 0, j = ports.length; i < j; i += 1) {
        this.portsUsed.push(ports[i].attrib);
      }
    } else {
      this.portsUsed.push(ports.attrib);
    }
  }

  /**
    * Provides default `osMatchs` property to ensure node processing, always returns
    * current osMatchs values
    * @type {Array}
    * @readonly
    */
  get osmatch() {
    return this.osMatchs;
  }

  /**
    * Adds any os matches to the `osMatchs` array
    * @param {Array} matches - Current `osmatch` node
    */
  set osmatch(matches) {
    if (Array.isArray(matches)) {
      for (let i = 0, j = matches.length; i < j; i += 1) {
        this.osMatchs.push(matches[i].attrib);
      }
    } else {
      this.osMatchs.push(matches.attrib);
    }
  }

  /**
    * Gets the most likely OS name
    * @param {Array} matches - Current `osmatch` node
    */
  get match() {
    return this.osMatchs[0].name || '';
  }
}

module.exports = Os;
