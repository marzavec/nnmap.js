const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given hostname structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} hostnamesStruct - Hostnames node to process
  */
class Hostnames {
  constructor(options, hostnamesStruct) {
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
      * Host name property default
      * @type {String}
      */
    this.name = '';

    /**
      * Host type property default
      * @type {String}
      */
    this.type = '';

    /**
      * Host names property default
      * @type {Array}
      */
    this.names = [];

    /**
      * Flag to check if it has multiple hostnames
      * @type {Boolean}
      */
    this.hasMultiple = false;

    // Attempt parsing or fail with error
    try {
      this.parseStruct(hostnamesStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing hostname data: ${err}`);
    }
  }

  /**
    * Recursive parsing function, sets the value of this classes properties (if
    * it exists), or calls the proper processing function, or builds required
    * child classes for further processing
    * @param {Object} curStruct - Current node being processed
    */
  parseStruct(curStruct) {
    if (this.hasMultiple) {
      for (let i = 0, j = curStruct.length; i < j; i += 1) {
        this.names.push(curStruct[i].attrib);
      }
    } else {
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
    * @type {Array}
    * @readonly
    */
  get data() {
    if (this.hasMultiple) {
      return this.names;
    }

    return [{
      name: this.name,
      type: this.type,
    }];
  }

  /**
    * Provides default `hostname` property to ensure node processing, always returns
    * current data values
    * @type {Object}
    * @readonly
    */
  get hostname() {
    return this.data;
  }

  /**
    * Continues node walking recursion through the current hostname node, flipping
    * the `hasMultiple` flag
    * @param {Object} name - Current `hostname` node
    */
  set hostname(name) {
    this.hasMultiple = Array.isArray(name);

    this.parseStruct(name);
  }
}

module.exports = Hostnames;
