/**
  * Contains various general-purpose utility methods
  */
class Util {
  constructor() {
    throw new Error('Util is a static class and should not be constructed');
  }

  /**
   * Sets properties on an object that are not already defined
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   * @private
   */
  static mergeDefault(def, given) {
    if (!given) {
      return def;
    }

    for (const key in def) { // eslint-disable-line no-restricted-syntax
      if (!{}.hasOwnProperty.call(given, key)) {
        // eslint-disable-next-line no-param-reassign
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        // eslint-disable-next-line no-param-reassign
        given[key] = this.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  }
}

module.exports = Util;
