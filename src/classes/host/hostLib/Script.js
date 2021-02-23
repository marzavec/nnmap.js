const Util = require('../../utility/Util');

/**
  * Processes and stores the values and meta data of a given script structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} scriptStruct - Script node to process
  */
class Script {
  constructor(options, scriptStruct) {
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
      * Script ID property default
      * @type {String}
      */
    this.id = '';

    /**
      * Script output property default
      * @type {String}
      */
    this.out = '';

    /**
      * Curkey property default
      * @type {String}
      */
    this.curKey = '';

    /**
      * Holds script details
      * @type {Number}
      */
    this.detailsMap = new Map();

    // Attempt parsing or fail with error
    try {
      this.parseStruct(scriptStruct);
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
      id: this.id,
      output: this.out,
      details: this.details,
    };
  }

  /**
    * Returns this scripts output
    * @type {Object}
    * @readonly
    */
  get output() {
    return this.out;
  }

  /**
    * Updates this scripts output
    * @param {String} scriptOutput - Current `output` node
    */
  set output(scriptOutput) {
    if (this.id === 'http-title') {
      if (scriptOutput === 'Site doesn&apos;t have a title (text/html).') {
        return;
      }
    }

    this.out = scriptOutput;
  }

  /**
    * Provides default `elem` property to ensure node processing, always returns
    * current script id
    * @type {String}
    * @readonly
    */
  get elem() {
    return this.id;
  }

  /**
    * Processes the element properties of the current script node, normalizing
    * and storing the data
    * @param {*} elemObj - Current `elem` node
    */
  set elem(elemObj) {
    if (typeof elemObj === 'string') {
      this.details = {
        key: 'key',
        data: elemObj,
      };
    } else if (Array.isArray(elemObj)) {
      if (typeof elemObj[0].attrib !== 'undefined' && typeof elemObj[0].attrib.key !== 'undefined' && elemObj[0].attrib.key === 'type') {
        const detailObj = {
          key: elemObj[0].text.replace(/[\W_]+/g, '_'),
          data: {},
        };
        for (let i = 1, j = elemObj.length; i < j; i += 1) {
          detailObj.data[elemObj[i].attrib.key.replace(/[\W_]+/g, '_')] = elemObj[i].text;
        }
        this.details = detailObj;
      } else {
        for (let i = 0, j = elemObj.length; i < j; i += 1) {
          if (typeof elemObj[i].attrib !== 'undefined') {
            this.details = {
              key: elemObj[i].attrib.key,
              data: elemObj[i].text,
            };
          }
        }
      }
    } else if (typeof elemObj === 'object') {
      if (typeof elemObj.attrib !== 'undefined') {
        this.details = {
          key: elemObj.attrib.key,
          data: elemObj.text,
        };
      }
    }
  }

  /**
    * Provides default `details` property to ensure node processing, always returns
    * current script details
    * @type {Object}
    * @readonly
    */
  get details() {
    const ret = {};
    for (const [k, v] of this.detailsMap) { // eslint-disable-line no-restricted-syntax
      ret[k] = v;
    }
    return ret;
  }

  /**
    * Stores data pulled from `elem` nodes, creating unique key names if the
    * current key already exists
    * @param {String} detail - Data to store
    */
  set details(detail) {
    if (this.detailsMap.has(detail.key)) {
      let i = 1;
      while (this.detailsMap.has(`${detail.key}_${i}`)) {
        i += 1;
      }
      this.detailsMap.set(`${detail.key}_${i}`, detail.data);
    } else {
      this.detailsMap.set(detail.key, detail.data);
    }
  }

  /**
    * Provides default `table` property to ensure node processing, always returns
    * current script id
    * @type {String}
    * @readonly
    */
  get table() {
    return this.id;
  }

  /**
    * Continues enumeration through table node structures
    * @param {*} tableStruct - Current `table` node
    */
  set table(tableStruct) {
    if (Array.isArray(tableStruct)) {
      for (let i = 0, j = tableStruct.length; i < j; i += 1) {
        this.parseStruct(tableStruct[i]);
      }
    } else {
      this.parseStruct(tableStruct);
    }
  }

  /**
    * Gets the current key for parsing `key` nodes
    * @type {String}
    * @readonly
    */
  get key() {
    return this.curKey;
  }

  /**
    * Sets the current key while parsing the script structure
    *
    * @param {String} newKey - New key value
    */
  set key(newKey) {
    this.curKey = newKey;
  }
}

module.exports = Script;
