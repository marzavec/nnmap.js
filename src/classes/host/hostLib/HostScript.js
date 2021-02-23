const Util = require('../../utility/Util');
const Script = require('./Script');

/**
  * Processes and stores the values and meta data of a given host script structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} hostScriptStruct - HostScript node to process
  */
class HostScript {
  constructor(options, hostScriptStruct) {
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
      * Scripts child holder
      * @type {Array}
      */
    this.scripts = [];

    // Attempt parsing or fail with error
    try {
      this.parseStruct(hostScriptStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing host script data: ${err}`);
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
      scripts: this.scripts.map((s) => s.data || []), // @type {Array}
    };
  }

  /**
    * Provides default `attrib` property to ensure node processing, always returns
    * current scripts values
    * @type {Array}
    * @readonly
    */
  get script() {
    return this.scripts;
  }

  /**
    * Continues node walking recursion through the current script node, creating
    * child classes as needed
    * @param {Object} scriptStruct - Current `script` node
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
}

module.exports = HostScript;
