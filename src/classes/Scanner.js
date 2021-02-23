const Fs = require('fs');

const EventWrapper = require('./base/EventWrapper');
const NmapWorker = require('./worker/NmapWorker');
const Parser = require('./Parser');
const Util = require('./utility/Util');

/**
  * Starts, stops and queues scan requests
  *
  * @param {Object} options - Class options
  * @extends {EventWrapper}
  */
class Scanner extends EventWrapper {
  constructor(options) {
    super(options);

    /**
      * Merge default options with given options
      * @type {Object}
      */
    this.options = Util.mergeDefault({
      autoParse: true, // @type {Boolean} optional
      debug: false, // @type {Boolean} optional
      deleteLogFile: false, // @type {Boolean} optional
      onError: null, // @type {Function} optional
      onWarning: null, // @type {Function} optional
      onDebug: null, // @type {Function} optional
      onReady: null, // @type {Function} optional
      onScanComplete: null, // @type {Function} optional
      onScanAbort: null, // @type {Function} optional
      onNmapOut: null, // @type {Function} optional
      profile: 'default', // @type {String} optional
      target: '', // @type {String} optional
      logDirectory: '', // @type {String} optional
      nmapPath: '', // @type {String} optional
      skipChecks: false, // @type {Boolean} optional
    }, options);

    /**
      * Main Nmap process handler
      * @type {NmapWorker}
      */
    this.worker = new NmapWorker({
      onError: this.throwError.bind(this),
      onWarning: this.throwWarning.bind(this),
      onDebug: this.throwDebug.bind(this),
      onReady: this.workerReady.bind(this),
      onFinish: this.scanCompleted.bind(this),
      onNmapOut: this.emitNmapOutput.bind(this),
      logDirectory: this.options.logDirectory,
      nmapPath: this.options.nmapPath,
      profile: this.options.profile,
      skipChecks: this.options.skipChecks,
    });

    /**
      * Scans waiting to be preformed
      * @type {Array}
      */
    this.scanQueue = [];

    /**
      * Main scan log parser
      * @type {Parser}
      */
    this.parser = new Parser();

    /**
      * Most recent scan object
      * @type {Object}
      */
    this.lastScanData = {
      logPath: '',
      nmapOut: '',
      nmapErr: '',
      exitCode: 0,
    };
  }

  /**
    * NmapWorker `ready` event handler
    * @private
    */
  workerReady() {
    /**
      * We are ready to scan
      * @event Scanner#ready
      */
    this.emit('ready');

    // Callback if required
    if (this.options.onReady) {
      this.options.onReady();
    }

    // Automagically start a scan if specified
    if (this.options.target !== '') {
      this.startScan(this.options.target);
    }
  }

  /**
    * Current profile getter
    * @type {String}
    * @readonly
    */
  get profile() {
    return this.options.profile;
  }

  /**
    * Current profile getter
    * @param {String} newProfile Target scan profile
    * @type {String}
    */
  set profile(newProfile) {
    this.options.profile = newProfile;
    this.worker.profile = newProfile;
  }

  /**
    * Add custom scan profile
    * @param {String} name Scan profile name
    * @param {String} args Nmap arguments
    */
  addProfile(name, args) {
    this.worker.addProfile(name, args);
  }

  /**
    * Indicates if a scan is currently running
    * @type {Boolean}
    * @readonly
    */
  get isBusy() {
    return this.worker.busy;
  }

  /**
    * Immediately starts a scan or queues the scan if one is currently running
    * @param {string} target Target hostname(s), IP address(es), network(s), etc.
    * @returns {Boolean} True if immediate start, false if queued
    * @public
    */
  startScan(target, profile = this.options.profile) {
    let scanOptions;

    // Target will be an object if it's a queued scan
    if (typeof target === 'string') {
      scanOptions = {
        target,
        profile,
        jobId: Math.random().toString(36).substring(2, 15),
        queued: this.isBusy,
      };
    } else {
      scanOptions = target;
    }

    // Queue scan if one is already running
    if (this.isBusy) {
      /**
        * Requested scan has been queued
        * @event Scanner#scanQueued
        */
      this.emit('scanQueued', scanOptions);

      this.scanQueue.push(scanOptions);

      return false;
    }

    /**
      * A scan has begun
      * @event Scanner#scanStarted
      */
    this.emit('scanStarted', scanOptions);

    this.worker.scan(scanOptions);

    return true;
  }

  /**
    * NmapWorker `onFinish` event handler
    * @param {Object} data Contains `logPath`, `nmapOut`, `nmapErr`, `exitCode`
    * @private
    */
  scanCompleted(data) {
    this.lastScanData = data;

    // Parse log data if required
    if (this.options.autoParse) {
      this.parser = new Parser({
        debug: this.options.debug,
        onParsed: this.logParsed.bind(this),
        logPath: data.logPath,
      });

      this.parser.on('error', this.throwError.bind(this));

      this.parser.on('warning', this.throwWarning.bind(this));

      this.parser.on('debug', this.throwDebug.bind(this));

      this.parser.startParse();
    } else {
      this.emitScan(false);
    }
  }

  /**
    * Parser `onParsed` event handler
    * @param {Object} data Contains parsed log data
    * @private
    */
  logParsed(data) {
    this.emitScan(data);
  }

  /**
    * Push scanComplete event with compiled scanData, starts next queued scan
    * @param {Object} data False if the log has not been parsed, or parsed log data
    * @private
    */
  emitScan(data) {
    const scanData = {
      logPath: this.lastScanData.logPath, // @type {String} Path to log file
      nmapOut: this.lastScanData.nmapOut, // @type {String} Nmap process std out
      nmapErr: this.lastScanData.nmapErr, // @type {String} Nmap process std error
      exitCode: this.lastScanData.exitCode, // @type {Number} Nmap process exit code
      scanData: data, // @type {?Object} Parsed log data or false
    };

    // Delete log file if required
    if (this.options.deleteLogFile) {
      Fs.unlink(scanData.logPath, (err) => {
        if (err) {
          this.throwError(`Unable to delete log file: ${scanData.logPath}\n${err}`);
        }
      });

      scanData.logPath = false;
    }

    /**
      * A scan has completed
      * @event Scanner#scanComplete
      */
    this.emit('scanComplete', scanData);

    if (this.options.onScanComplete) {
      this.options.onScanComplete(scanData);
    }

    // Clear previous data
    this.lastScanData = {};

    // Start next scan if any are pending
    if (this.scanQueue.length > 0) {
      const nextTarget = this.scanQueue.shift();

      this.startScan(nextTarget);
    }
  }

  /**
    * Force quit current scan
    * @return {Boolean} true if kill succeeds, and false otherwise
    */
  killScan() {
    if (this.isBusy) {
      const killResult = this.worker.killScan();

      /**
        * A scan has been canceled
        * @event Scanner#scanAborted
        */
      this.emit('scanAborted', killResult);

      if (this.options.onScanAbort) {
        this.options.onScanAbort(killResult);
      }

      return killResult.killed;
    }

    return false;
  }

  /**
    * Event handler for live nmap std out
    * @private
    */
  emitNmapOutput(data) {
    /**
      * Nmap live std output
      * @event Scanner#nmapOut
      */
    this.emit('nmapOut', data.toString('utf8'));

    if (this.options.onNmapOut) {
      this.options.onNmapOut(data.toString('utf8'));
    }
  }
}

module.exports = Scanner;
