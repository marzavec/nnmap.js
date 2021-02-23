/* eslint no-bitwise: 0, no-param-reassign: 0 */

const Os = require('os');
const Path = require('path');
const { spawn } = require('child_process');

const Util = require('../utility/Util');
const { ScanProfiles } = require('../utility/Constants');

/**
  * Interfaces with the nmap process and reports the results
  * @param {Object} options - Class options
  */
class NmapWorker {
  constructor(options) {
    /**
      * Merge default options with given options
      * @type {Object}
      */
    this.options = Util.mergeDefault({
      onError: () => {}, // @type {Function}
      onWarning: () => {}, // @type {Function}
      onDebug: () => {}, // @type {Function}
      onReady: () => {}, // @type {Function}
      onFinish: () => {}, // @type {Function}
      onNmapOut: () => {}, // @type {Function}
      logDirectory: '', // @type {String}
      profile: 'Default', // @type {String}
      args: '', // @type {String}
      nmapPath: '', // @type {String}
      maxScanTime: 900000, // @type {Number} 15 minutes default
      skipChecks: false, // @type {Boolean}
    }, options);

    /**
      * Reference to the current OS
      * @type {Boolean}
      */
    this.isWin = process.platform === 'win32';

    /**
      * Indicates if a scan is currently running
      * @type {Boolean}
      */
    this.busy = false;

    /**
      * Scan options of the currently running scan
      * @type {Object}
      */
    this.currentScan = {};

    /**
      * Stores custom profiles by name
      * @type {Map}
      */
    this.customProfiles = new Map();

    /**
      * Current nmap child process
      * @type {ChildProcess}
      */
    this.nmapProcess = null;

    /**
      * Nmap process std out buffer
      * @type {String}
      */
    this.stdoutBuffer = '';

    /**
      * Nmap process std error buffer
      * @type {String}
      */
    this.stderrBuffer = '';

    /**
      * File extension for the log file
      * @type {String}
      */
    this.logExt = 'html';

    // Validate working enviroment if required
    if (this.options.skipChecks) {
      this.options.onReady();
    } else {
      this.runChecks();
    }
  }

  /**
    * Path to save log files to, returns the temp directory if not specified
    * @type {String}
    * @readonly
    */
  get logDirectory() {
    if (this.options.logDirectory !== '') {
      return `${this.options.logDirectory}${Path.sep}`;
    }

    return `${Os.tmpdir()}${Path.sep}`;
  }

  /**
    * Name of the log file
    * @type {String}
    * @readonly
    */
  get logName() {
    return `${Math.random().toString(36).substring(2, 15)}.${this.logExt}`;
  }

  /**
    * Add custom scan profile
    * @param {String} name Scan profile name
    * @param {String} args Nmap arguments
    */
  addProfile(name, args) {
    this.customProfiles.set(name, args);
  }

  /**
    * Changes current scan profile
    * @param {String} newProfile Target scan profile
    */
  set profile(newProfile) {
    this.options.profile = newProfile;
  }

  /**
    * Current profile name getter
    * @readonly
    */
  get profile() {
    return this.options.profile;
  }

  /**
    * Get current nmap arguements by profile name, default profile is provided
    * if specified name is not found
    * @readonly
    */
  get profileArgs() {
    let { args } = ScanProfiles.default;
    let found = false;

    // Check for profile in built-in profile list
    Object.keys(ScanProfiles).forEach((profile) => {
      if (ScanProfiles[profile].name === this.profile) {
        args = ScanProfiles[profile].args;
        found = true;
      }
    });

    // If not found, check for custom profile name
    if (!found && this.customProfiles.has(this.profile)) {
      args = this.customProfiles.get(this.profile);
    }

    return args;
  }

  /**
    * Splits a string into an array on each space while respecting quoutes
    * @param {String} input Target string
    * @private
    * @returns {Array}
    */
  static stringToArgs(input) {
    return input.match(/\\?.|^$/g).reduce((p, c) => {
      if (c === '"' || c === "'") {
        p.quote ^= 1;
        p.a[p.a.length - 1] += c;
      } else if (!p.quote && c === ' ') {
        p.a.push('');
      } else {
        p.a[p.a.length - 1] += c;
      }

      return p;
    }, { a: [''] }).a;
  }

  /**
    * Run environment checks to make sure we can execute nmap
    * @private
    */
  async runChecks() {
    // Set options to not create a log or specify a target, ask nmap to output version
    const nmapOptions = {
      logPath: false,
      target: false,
      args: '-V',
    };

    try {
      await this.runNmap(nmapOptions);
    } catch (err) {
      this.options.onError(`Nmap Execution Error:\n${err}\n${this.stdoutBuffer}\n${this.stderrBuffer}`);
      this.reset();

      return false;
    }

    // Clear un-needed data
    this.reset();

    // Notify parent that we are ready
    this.options.onReady();

    return true;
  }

  /**
    * Create a new instance of nmap
    * @param {Object} nmapOptions Includes `logPath`, `target`, `args`
    * @private
    */
  async runNmap(nmapOptions) {
    let nmapPath = '';

    // Append specified path to `nmapPath` if specified
    if (this.options.nmapPath !== '') {
      nmapPath += `${this.options.nmapPath}${Path.sep}`;
    }

    // `nmapPath` will be `nmap` or `/path/to/nmap`
    nmapPath += 'nmap';

    const { target, args } = nmapOptions;
    let { logPath } = nmapOptions;

    // Store args, casting is done explicitly on purpose
    let argArray = this.constructor.stringToArgs(`${args}`);

    // Append nmap args to create html log to specified path
    if (logPath) {
      if (this.isWin) {
        logPath = Path.win32.normalize(logPath);
      } else {
        logPath = Path.normalize(logPath);
      }

      if (logPath.indexOf(' ') !== -1) {
        logPath = `"${logPath}"`;
      }

      argArray = [...argArray, ...this.constructor.stringToArgs(`--no-stylesheet -oX ${logPath}`)];
    }

    // Append target specification with the `-6` flag if ipv6 included
    if (target) {
      if (target.indexOf(':') !== -1) {
        argArray.push('-6');
      }

      argArray = [...argArray, ...this.constructor.stringToArgs(`${target}`)];
    }

    // Emit debug info
    this.options.onDebug(`Invoking nmap as: ${nmapPath} ${argArray.join(' ')}`);

    return new Promise((resolve, reject) => {
      this.nmapProcess = spawn(nmapPath, argArray, {
        timeout: this.options.maxScanTime, // default: 15 minutes
        windowsVerbatimArguments: true,
        shell: true,
      });

      this.nmapProcess.on('error', reject);

      this.nmapProcess.on('close', (code) => resolve(code));

      this.nmapProcess.stdout.on('data', (data) => {
        this.options.onNmapOut(data);
        this.stdoutBuffer += data;
      });

      this.nmapProcess.stderr.on('data', (data) => {
        this.stderrBuffer += data;
      });
    });
  }

  /**
    * Start a new scan
    * @param {Object} scanOptions Inlcude `target`, `profile`
    * @public
    */
  async scan(scanOptions) {
    this.busy = true;
    this.currentScan = scanOptions;
    this.profile = scanOptions.profile;

    const nmapOptions = {
      logPath: `${this.logDirectory}${this.logName}`,
      target: scanOptions.target,
      args: this.profileArgs,
    };

    let exitCode = 0;

    try {
      exitCode = await this.runNmap(nmapOptions);
    } catch (err) {
      this.options.onError(`Nmap Execution Error:\n${err}\n${this.stdoutBuffer}\n${this.stderrBuffer}`);
    }

    const results = {
      logPath: nmapOptions.logPath,
      nmapOut: `${this.stdoutBuffer}`,
      nmapErr: `${this.stderrBuffer}`,
      exitCode: exitCode || -1,
    };

    this.reset();

    this.options.onFinish(results);
  }

  /**
    * Clear no longer needed properties
    */
  reset() {
    this.busy = false;
    this.stdoutBuffer = '';
    this.stderrBuffer = '';
  }

  /**
    * Force quit current scan
    * @return {Object} The current scan options + the kill result
    */
  killScan() {
    const killedScan = this.currentScan;
    killedScan.killed = this.nmapProcess.kill('SIGKILL');

    this.reset();

    return killedScan;
  }
}

module.exports = NmapWorker;
