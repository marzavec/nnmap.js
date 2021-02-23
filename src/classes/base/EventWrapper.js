const EventEmitter = require('events');

/**
  * Core parser for nmap xml log files
  * @param {Object} options - Class options
  * @extends {EventEmitter}
  */
class EventWrapper extends EventEmitter {
  constructor(options) {
    super();

    this.options = options;
  }

  /**
    * Emits an error to any listeners, calls the `onError` function if set
    * @param {String} errText - Error message text value
    * @returns {Boolean}
    */
  throwError(errText) {
    this.lastError = new Error(errText);

    if (this.options.onError) {
      this.options.onError(this.lastError);
    } else {
      this.emit('error', this.lastError);
    }
  }

  /**
    * Emits a warning to any listeners, calls the `onWarning` function if set
    * @param {String} warnText - Warning message text value
    */
  throwWarning(warnText) {
    this.lastWarning = warnText;

    if (this.options.onWarning) {
      this.options.onWarning(this.lastWarning);
    } else {
      this.emit('warning', this.lastWarning);
    }
  }

  /**
    * Emits a debug message to any listeners, calls the `onDebug` function if set
    * @param {String} debugText - Debug message text value
    */
  throwDebug(debugText) {
    if (!this.options.debug) {
      return;
    }

    if (this.options.onDebug) {
      this.options.onDebug(debugText);
    } else {
      this.emit('debug', debugText);
    }
  }
}

module.exports = EventWrapper;
