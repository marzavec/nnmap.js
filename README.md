[![NPM version](https://img.shields.io/npm/v/nnmap.js.svg?maxAge=3600)](https://www.npmjs.com/package/nnmap.js)
[![NPM downloads](https://img.shields.io/npm/dt/nnmap.js.svg?maxAge=3600)](https://www.npmjs.com/package/nnmap.js)
[![travis build](https://img.shields.io/travis/marzavec/nnmap.js.svg?style=flat)](https://travis-ci.org/marzavec/nnmap.js)
[![Dependency Status](https://david-dm.org/marzavec/nnmap.js.svg?theme=shields.io)](https://david-dm.org/marzavec/nnmap.js)
[![Codecov](https://img.shields.io/codecov/c/github/marzavec/nnmap.js.svg)](https://app.codecov.io/gh/marzavec/nnmap.js)
[![Language grade: JS/TS](https://img.shields.io/lgtm/grade/javascript/github/marzavec/nnmap.js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/marzavec/nnmap.js/context:javascript)
[![MIT License](https://img.shields.io/github/license/marzavec/nnmap.js.svg?style=flat)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat)](https://github.com/semantic-release/semantic-release)
[![Patreon](https://img.shields.io/badge/donate-patreon-orange.svg)](https://www.patreon.com/marzavec)


## Table of contents

- [About](#about)
- [Installation](#installation)
- [Example Usage](#example-usage)
- [Links](#links)
  - [Extensions](#extensions)
- [Contributing](#contributing)
- [Help](#help)

## About

nnmap.js is a lightweight [Nmap](https://nmap.org/) wrapper module with a focus on predictable (and sane) scan output. The module consists of a `Scanner` and `Parser` class.

- Single dependency
  - That dependency has zero dependencies
- Predictable log data abstraction
- Stable profile-based scanning
- Built-in scan job queueing
- Supports both events and callbacks
- Live scan output available
- Baked in IPv6 flags

## Installation

**Node.js (version 14.0) and Nmap (version 7.8) or newer are required.**

Add to your project with: `npm install nnmap.js --save`

## Example usage

**Example using events:**

```js
const util = require('util');
const { Scanner } = require('nnmap.js');

const scanner = new Scanner({
  profile: 'Quick scan',
});

scanner.on('ready', () => {
  scanner.startScan('scanme.nmap.org');
});

scanner.on('scanComplete', (nmapOut) => {
  console.log(util.inspect(nmapOut.scanData.data, false, null, true));
});
```

**Example using callbacks:**

```js
const util = require('util');
const { Scanner } = require('nnmap.js');

const scanner = new Scanner({
  target: 'scanme.nmap.org',
  profile: 'Quick scan',
  onScanComplete: (nmapOut) => {
    console.log(util.inspect(nmapOut.scanData.data, false, null, true));
  },
});
```

## Links

- [Documentation](https://nnmap.js.org/)
- [GitHub](https://github.com/marzavec/nnmap.js)
- [NPM](https://www.npmjs.com/package/nnmap.js)
- [Nmap](https://nmap.org/)

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested, and double-check the [documentation](https://nnmap.js.org/#/docs).
