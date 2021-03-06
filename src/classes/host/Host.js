const Util = require('../utility/Util');

const {
  Address,
  Distance,
  Hostnames,
  Ipidsequence,
  Os,
  Ports,
  Status,
  Tcpsequence,
  Tcptssequence,
  Times,
  HostScript,
  Trace,
  Uptime,
} = require('./hostLib');

/**
  * Processes and stores the values and meta data of a given host structure
  * @param {Object} options - Error, warning and debug function references
  * @param {Object} hostStruct - Host node to process
  */
class Host {
  constructor(options, hostStruct) {
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
      * Start time meta
      * @type {Number}
      */
    this.starttime = {};

    /**
      * End time meta
      * @type {Number}
      */
    this.endtime = {};

    /**
      * Status object default
      * @type {Object}
      */
    this.hostStatus = {};

    /**
      * Address object default
      * @type {Object}
      */
    this.hostAddress = {};

    /**
      * Hostnames object default
      * @type {Object}
      */
    this.hostHostnames = {};

    /**
      * Ports object default
      * @type {Object}
      */
    this.hostPorts = {};

    /**
      * Os object default
      * @type {Object}
      */
    this.hostOs = {};

    /**
      * Uptime object default
      * @type {Object}
      */
    this.hostUptime = {};

    /**
      * Distance object default
      * @type {Object}
      */
    this.hostDistance = {};

    /**
      * Tcpsequence object default
      * @type {Object}
      */
    this.hostTcpsequence = {};

    /**
      * Ipidsequence object default
      * @type {Object}
      */
    this.hostIpidsequence = {};

    /**
      * Tcptssequence object default
      * @type {Object}
      */
    this.hostTcptssequence = {};

    /**
      * HostScript object default
      * @type {Object}
      */
    this.hostHostScript = {};

    /**
      * Trace object default
      * @type {Object}
      */
    this.hostTrace = {};

    /**
      * Times object default
      * @type {Object}
      */
    this.hostTimes = {};

    // Attempt parsing or fail with error
    try {
      this.parseStruct(hostStruct);
    } catch (err) {
      this.options.onError(`${this.constructor.name} Class Error:
        Error parsing host data: ${err}`);
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
    * Returns start and end time meta
    * @type {Object}
    * @readonly
    */
  get meta() {
    return {
      starttime: this.starttime,
      endtime: this.endtime,
    };
  }

  /**
    * Provides default `status` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get status() {
    return this.hostStatus.data || this.hostStatus;
  }

  /**
    * Creates Status child for further processing of the status node
    * @param {Object} status - Status node
    */
  set status(status) {
    this.hostStatus = new Status(this.options, status);
  }

  /**
    * Provides default `address` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get address() {
    return this.hostAddress.data || this.hostAddress;
  }

  /**
    * Creates Address child for further processing of the address node
    * @param {Object} address - Address node
    */
  set address(address) {
    this.hostAddress = new Address(this.options, address);
  }

  /**
    * Provides default `hostnames` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get hostnames() {
    return this.hostHostnames.data || this.hostHostnames;
  }

  /**
    * Creates Hostnames child for further processing of the hostnames node
    * @param {Object} hostnames - Hostnames node
    */
  set hostnames(hostnames) {
    this.hostHostnames = new Hostnames(this.options, hostnames);
  }

  /**
    * Provides default `ports` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get ports() {
    return this.hostPorts.data || this.hostPorts;
  }

  /**
    * Creates Ports child for further processing of the ports node
    * @param {Object} ports - Ports node
    */
  set ports(ports) {
    this.hostPorts = new Ports(this.options, ports);
  }

  /**
    * Provides default `os` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get os() {
    return this.hostOs.data || this.hostOs;
  }

  /**
    * Creates Os child for further processing of the os node
    * @param {Object} os - Os node
    */
  set os(os) {
    this.hostOs = new Os(this.options, os);
  }

  /**
    * Provides default `uptime` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get uptime() {
    return this.hostUptime.data || this.hostUptime;
  }

  /**
    * Creates Uptime child for further processing of the uptime node
    * @param {Object} uptime - Uptime node
    */
  set uptime(uptime) {
    this.hostUptime = new Uptime(this.options, uptime);
  }

  /**
    * Provides default `distance` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get distance() {
    return this.hostDistance.data || this.hostDistance;
  }

  /**
    * Creates Distance child for further processing of the distance node
    * @param {Object} distance - Distance node
    */
  set distance(distance) {
    this.hostDistance = new Distance(this.options, distance);
  }

  /**
    * Provides default `tcpsequence` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get tcpsequence() {
    return this.hostTcpsequence.data || this.hostTcpsequence;
  }

  /**
    * Creates Tcpsequence child for further processing of the tcpsequence node
    * @param {Object} tcpsequence - Tcpsequence node
    */
  set tcpsequence(tcpsequence) {
    this.hostTcpsequence = new Tcpsequence(this.options, tcpsequence);
  }

  /**
    * Provides default `ipidsequence` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get ipidsequence() {
    return this.hostIpidsequence.data || this.hostIpidsequence;
  }

  /**
    * Creates Ipidsequence child for further processing of the ipidsequence node
    * @param {Object} ipidsequence - Ipidsequence node
    */
  set ipidsequence(ipidsequence) {
    this.hostIpidsequence = new Ipidsequence(this.options, ipidsequence);
  }

  /**
    * Provides default `tcptssequence` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get tcptssequence() {
    return this.hostTcptssequence.data || this.hostTcptssequence;
  }

  /**
    * Creates Tcptssequence child for further processing of the tcptssequence node
    * @param {Object} tcptssequence - Tcptssequence node
    */
  set tcptssequence(tcptssequence) {
    this.hostTcptssequence = new Tcptssequence(this.options, tcptssequence);
  }

  /**
    * Provides default `hostscript` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get hostscript() {
    return this.hostHostScript.data || this.hostHostScript;
  }

  /**
    * Creates HostScript child for further processing of the hostScript node
    * @param {Object} hostScript - HostScript node
    */
  set hostscript(hostScript) {
    this.hostHostScript = new HostScript(this.options, hostScript);
  }

  /**
    * Provides default `trace` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get trace() {
    return this.hostTrace.data || this.hostTrace;
  }

  /**
    * Creates Trace child for further processing of the trace node
    * @param {Object} trace - Trace node
    */
  set trace(trace) {
    this.hostTrace = new Trace(this.options, trace);
  }

  /**
    * Provides default `times` property to ensure node processing, will return
    * default or child data
    * @type {Object}
    * @readonly
    */
  get times() {
    return this.hostTimes.data || this.hostTimes;
  }

  /**
    * Creates Times child for further processing of the times node
    * @param {Object} times - Times node
    */
  set times(times) {
    this.hostTimes = new Times(this.options, times);
  }

  /**
    * Returns all processed data, including child data, of the this host
    * @type {Object}
    * @readonly
    */
  get data() {
    return {
      meta: this.meta, // @type {Object}
      status: this.status, // @type {Object}
      address: this.address, // @type {Array}
      hostnames: this.hostnames, // @type {Array}
      ports: this.ports, // @type {Object}
      os: this.os, // @type {Object}
      uptime: this.uptime, // @type {Object}
      distance: this.distance, // @type {Number}
      tcpsequence: this.tcpsequence, // @type {Object}
      ipidsequence: this.ipidsequence, // @type {Object}
      tcptssequence: this.tcptssequence, // @type {Object}
      hostscript: this.hostscript, // @type {Object}
      trace: this.trace, // @type {Object}
      times: this.times, // @type {Object}
    };
  }
}

module.exports = Host;
