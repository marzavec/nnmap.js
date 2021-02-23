const Util = require('../utility/Util');
const Host = require('../host/Host');

/**
  * Processes and stores the values and meta data of a given scan log structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} scanStruct - JS structure to process
  */
class Scan {
  constructor(options, scanStruct) {
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
      * Simple structure validation, an `nmaprun` node in the passed structure
      * is required to continue
      */
    if (typeof scanStruct.nmaprun === 'undefined') {
      this.options.onError(`${this.constructor.name} Class Error:
        Invalid scan log structure, missing property "nmaprun"`);
    }

    /**
      * Scan type meta default
      * @type {String}
      */
    this.scanner = '';

    /**
      * Scan args meta default
      * @type {String}
      */
    this.args = '';

    /**
      * Scan start time unix meta default
      * @type {Number}
      */
    this.start = 0;

    /**
      * Scan start time plain meta default
      * @type {String}
      */
    this.startstr = '';

    /**
      * Scanner version meta default
      * @type {Number}
      */
    this.version = 0;

    /**
      * Scanner output xml version meta default
      * @type {String}
      */
    this.xmloutputversion = 0;

    /**
      * Scan type meta default
      * @type {String}
      */
    this.type = '';

    /**
      * Scan protocol meta default
      * @type {String}
      */
    this.protocol = '';

    /**
      * Scan service count meta default
      * @type {Number}
      */
    this.numservices = 0;

    /**
      * Scan ports meta default
      * @type {String}
      */
    this.services = '';

    /**
      * Scan verbosity level meta default
      * @type {String}
      */
    this.verbosityLevel = 0;

    /**
      * Scan debugging level meta default
      * @type {String}
      */
    this.debuggingLevel = 0;

    /**
      * Scanned hosts object
      * @type {Array}
      */
    this.hosts = [];

    /**
      * Scan stats stats finished time meta default
      * @type {Number}
      */
    this.time = 0;

    /**
      * Scan stats stats finished time as string meta default
      * @type {String}
      */
    this.timestr = '';

    /**
      * Scan stats elapsed time meta default
      * @type {Number}
      */
    this.elapsed = 0;

    /**
      * Scan stats summary meta default
      * @type {String}
      */
    this.summary = 'Possible interrupted scan';

    /**
      * Scan stats exit info meta default
      * @type {String}
      */
    this.exit = 'failure';

    /**
      * Scan stats host count default
      * @type {Number}
      */
    this.up = 0;

    /**
      * Scan stats host count default
      * @type {Number}
      */
    this.down = 0;

    /**
      * Scan stats host count default
      * @type {Number}
      */
    this.total = 0;

    // Attempt parsing or fail with error
    try {
      this.parseStruct(scanStruct.nmaprun || {});
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing scan log: ${err}`);
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
    return this.meta;
  }

  /**
    * Continues node walking recursion through the current attrib node
    * @param {Object} meta - Current `attrib` node
    */
  set attrib(meta) {
    this.parseStruct(meta);
  }

  /**
    * Returns all current scan meta values
    * @type {Object}
    * @readonly
    */
  get meta() {
    return {
      scanner: this.scanner, // @type {String}
      args: this.args, // @type {String}
      start: this.start, // @type {Number}
      startstr: this.startstr, // @type {String}
      version: this.version, // @type {Number}
      xmloutputversion: this.xmloutputversion, // @type {Number}
      verbosity: this.verbose, // @type {Number}
      debugging: this.debugging, // @type {Number}
    };
  }

  /**
    * Returns all current scan info meta values
    * @type {Object}
    * @readonly
    */
  get scaninfo() {
    return {
      type: this.type, // @type {String}
      protocol: this.protocol, // @type {String}
      numservices: this.numservices, // @type {Number}
      services: this.services, // @type {String}
    };
  }

  /**
    * Continues node walking recursion through the current scaninfo node
    * @param {Object} info - Current `scaninfo` node
    */
  set scaninfo(info) {
    this.parseStruct(info);
  }

  /**
    * Returns all processed data, including child data, of the this scan
    * @type {Object}
    * @readonly
    */
  get data() {
    return {
      meta: this.meta, // @type {Object}
      scaninfo: this.scaninfo, // @type {Object}
      hosts: this.hosts.map((h) => h.data || {}), // @type {Array}
      runstats: this.runstats, // @type {Object}
    };
  }

  /**
    * Provides default `verbose` property to ensure node processing, will return
    * default or newly set value
    * @type {Number}
    * @readonly
    */
  get verbose() {
    return this.verbosityLevel;
  }

  /**
    * Applies the new value for `verbosityLevel`
    * @param {Number} verbosityLevel - Parsed verbosity level
    */
  set verbose(verbosityLevel) {
    this.verbosityLevel = verbosityLevel.attrib.level;
  }

  /**
    * Provides default `debugging` property to ensure node processing, will return
    * default or newly set value
    * @type {Number}
    * @readonly
    */
  get debugging() {
    return this.debuggingLevel;
  }

  /**
    * Applies the new value for `debugging`
    * @param {Number} debuggingLevel - Parsed debugging level
    */
  set debugging(debuggingLevel) {
    this.debuggingLevel = debuggingLevel.attrib.level;
  }

  /**
    * Provides default `host` property to ensure node processing, will return
    * default or newly set value
    * @type {Array}
    * @readonly
    */
  get host() {
    return this.hosts;
  }

  /**
    * Loops through the provided hosts array node and creates Host children for
    * further processing
    * @param {Array} hostStruct - Host array node
    */
  set host(hostStruct) {
    if (Array.isArray(hostStruct)) {
      for (let i = 0, j = hostStruct.length; i < j; i += 1) {
        this.hosts.push(new Host(this.options, hostStruct[i]));
      }
    } else {
      this.hosts.push(new Host(this.options, hostStruct));
    }
  }

  /**
    * Returns all current scan run stats meta values
    * @type {Object}
    * @readonly
    */
  get runstats() {
    return {
      time: this.time, // @type {Number}
      timestr: this.timestr, // @type {String}
      elapsed: this.elapsed, // @type {Number}
      summary: this.summary, // @type {String}
      exit: this.exit, // @type {String}
      up: this.up, // @type {Number}
      down: this.down, // @type {Number}
      total: this.total, // @type {Number}
    };
  }

  /**
    * Continues node walking recursion through the current runstats node
    * @param {Object} stats - Current `runstats` node
    */
  set runstats(stats) {
    if (stats.finished) {
      this.parseStruct(stats.finished);
    }

    if (stats.hosts) {
      this.parseStruct(stats.hosts);
    }
  }
}

module.exports = Scan;
