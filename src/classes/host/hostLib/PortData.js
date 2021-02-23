const Util = require('../../utility/Util');
const Script = require('./Script');

/**
  * Processes and stores the values and meta data of a given port data structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} portStruct - PortData node to process
  */
class PortData {
  constructor(options, portStruct) {
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
      * Port protocol property default
      * @type {String}
      */
    this.protocol = '';

    /**
      * Port ID property default
      * @type {Number}
      */
    this.portid = -1;

    /**
      * Open / close state property default
      * @type {String}
      */
    this.openState = '';

    /**
      * Reason property default
      * @type {String}
      */
    this.reason = '';

    /**
      * Reason time to live property default
      * @type {Number}
      */
    this.reason_ttl = -1;

    /**
      * Port name property default
      * @type {String}
      */
    this.name = '';

    /**
      * Product name property default
      * @type {String}
      */
    this.product = '';

    /**
      * Version property default
      * @type {String}
      */
    this.version = '';

    /**
      * Extra port info property default
      * @type {String}
      */
    this.extrainfo = '';

    /**
      * OS Type property default
      * @type {String}
      */
    this.ostype = '';

    /**
      * Service FP property default
      * @type {String}
      */
    this.servicefp = '';

    /**
      * Connection method property default
      * @type {String}
      */
    this.method = '';

    /**
      * Conf property default
      * @type {Number}
      */
    this.conf = -1;

    /**
      * CPE property default
      * @type {Array}
      */
    this.cpe = [];

    /**
      * Ports used property default
      * @type {Array}
      */
    this.portsUsed = [];

    /**
      * Port scripts property default
      * @type {Array}
      */
    this.scripts = [];

    // Attempt parsing or fail with error
    try {
      this.parseStruct(portStruct);
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
      protocol: this.protocol, // @type {String}
      portid: this.number, // @type {Number}
      state: this.openState, // @type {String}
      reason: this.reason, // @type {String}
      reason_ttl: this.reason_ttl, // @type {Number}
      name: this.name, // @type {String}
      product: this.product, // @type {String}
      version: this.version, // @type {String}
      extrainfo: this.extrainfo, // @type {String}
      ostype: this.ostype, // @type {String}
      servicefp: this.servicefp, // @type {String}
      method: this.method, // @type {String}
      conf: this.conf, // @type {Number}
      cpe: this.cpe, // @type {Array}
      scripts: this.scripts.map((s) => s.data || []), // @type {Array}
    };
  }

  /**
    * Provides default `openState` property to ensure node processing, always returns
    * current openState values
    * @type {Object}
    * @readonly
    */
  get state() {
    return this.openState;
  }

  /**
    * Sets state based on type of node data
    * @param {Object||String} stateData - Current `state` node
    */
  set state(stateData) {
    if (typeof stateData.attrib !== 'undefined') {
      this.parseStruct(stateData.attrib);
    } else if (typeof stateData === 'string') {
      this.openState = stateData;
    }
  }

  /**
    * Provides default `service` property to ensure node processing, always returns
    * current data values
    * @type {Object}
    * @readonly
    */
  get service() {
    return this.data;
  }

  /**
    * Sets service details, continues node processing
    * @param {Object} serviceStruct - Current `service` node
    */
  set service(serviceStruct) {
    this.parseStruct(serviceStruct);
  }

  /**
    * Gets the scripts used to test this port
    * @type {Array}
    * @readonly
    */
  get script() {
    return this.scripts;
  }

  /**
    * Sets script details, creating script children as needed
    * @param {Object||Array} scriptStruct - Current `script` node
    */
  set script(scriptStruct) {
    if (Array.isArray(scriptStruct)) {
      for (let i = 0, j = scriptStruct.length; i < j; i += 1) {
        this.scripts.push(new Script(this.options, scriptStruct[i]));
      }
    } else {
      this.scripts.push(new Script(this.options, scriptStruct));
    }
  }

  /**
    * Gets this port's number
    * @type {Number}
    * @readonly
    */
  get number() {
    return this.portid;
  }
}

module.exports = PortData;
