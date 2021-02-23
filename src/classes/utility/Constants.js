/**
  * Default nmap arguement options
  * @typedef {Object} ScanProfiles
  * @property {String} name Profile name
  * @property {String} args Nmap arguements
  */
exports.ScanProfiles = {
  default: {
    name: 'Default',
    args: '-A -O -sV -sS -T4 --system-dns --open',
  },
  intense: {
    name: 'Intense scan',
    args: '-T4 -A -v',
  },
  intenseUdp: {
    name: 'Intense scan plus UDP',
    args: '-sS -sU -T4 -A -v',
  },
  intenseTcp: {
    name: 'Intense scan, all TCP ports',
    args: '-p 1-65535 -T4 -A -v',
  },
  intenseNoPing: {
    name: 'Intense scan, no ping',
    args: '-T4 -A -v -Pn',
  },
  ping: {
    name: 'Ping scan',
    args: '-sn',
  },
  quick: {
    name: 'Quick scan',
    args: '-T4 -F',
  },
  quickPlus: {
    name: 'Quick scan plus',
    args: '-sV -T4 -O -F --version-light',
  },
  quickTrace: {
    name: 'Quick traceroute',
    args: '-sn --traceroute',
  },
  regular: {
    name: 'Regular scan',
    args: '',
  },
  slow: {
    name: 'Slow comprehensive scan',
    args: '-sS -sU -T4 -A -v -PE -PP -PS80,443 -PA3389 -PU40125 -PY -g 53 --script "default or (discovery and safe)"',
  },
  test: {
    name: 'test',
    args: '-sP',
  },
};
