const fs = require('fs');

const { expect } = require('chai');
const { Scanner } = require('../src');

describe('Checking Scanner class', () => {
  it('should be constructed', () => {
    expect(new Scanner()).to.be.an.instanceof(Scanner);
  });

  it('should skip enviroment checks if requested', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      skipChecks: true,
      onReady: () => {
        done();
      },
    });
  });

  it('should accept an onReady callback', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      onReady: () => {
        done();
      },
    });
  }).timeout(1000);

  it('should accept an onNmapOut callback', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      onNmapOut: () => {
        done();
      },
    });
  }).timeout(1000);

  it('should accept profile changes', () => {
    const scanner = new Scanner();
    scanner.profile = 'Quick scan plus';
    expect(scanner.profile).to.equal('Quick scan plus');
  });

  it('should accept custom profiles', () => {
    const scanner = new Scanner();
    scanner.addProfile('testing', 'this is a test');
    scanner.profile = 'testing';
    expect(scanner.worker.profileArgs).to.equal('this is a test');
  });

  it('should fail on bad arguments', (done) => {
    const scanner = new Scanner({
      onError: () => {
        done();
      },
    });
    scanner.addProfile('testing', '-this -is a -test');
    scanner.profile = 'testing';
    scanner.startScan('127.0.0.1');
  });

  /* it('should fail if there are scan errors', (done) => {
    const scanner = new Scanner({
      profile: 'test',
      autoParse: false,
      onError: () => {
        scanner.killScan();
        done();
      },
    });

    scanner.on('ready', () => {
      // scan worker options should _never_ be changed this way though
      // gotta get that 100% coverage, amirite?
      scanner.worker.options.nmapPath = '/fake/path/';
      scanner.startScan('127.0.0.1');
    });
  }); */

  it('should be able to abort a scan', () => {
    const scanner = new Scanner({
      autoParse: false,
    });

    scanner.on('ready', () => {
      if (scanner.startScan('127.0.0.1')) {
        expect(scanner.killScan()).to.be.true; // eslint-disable-line no-unused-expressions
      }
    });
  });

  it('should not abort if there is no scan', () => {
    const scanner = new Scanner();

    scanner.on('ready', () => {
      expect(scanner.killScan()).to.be.false; // eslint-disable-line no-unused-expressions
    });
  });

  it('should accept an onScanAbort callback', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      autoParse: false,
      onScanAbort: () => {
        done();
      },
    });

    scanner.on('ready', () => {
      if (scanner.startScan('127.0.0.1')) {
        scanner.killScan();
      }
    });
  });

  it('should auto scan if a target is provided', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      target: '127.0.0.1',
      profile: 'test',
      autoParse: false,
      onScanComplete: (scanData) => {
        expect(scanData).to.be.an.instanceof(Object);
        done();
      },
    });
  }).timeout(5000);

  it('should accept a new log file location', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      target: '127.0.0.1',
      profile: 'test',
      autoParse: false,
      logDirectory: __dirname,
      onScanComplete: (scanData) => {
        // eslint-disable-next-line no-unused-expressions
        expect(fs.existsSync(scanData.logPath)).to.be.true;
        fs.unlink(scanData.logPath, () => {});

        done();
      },
    });
  }).timeout(5000);

  it('should delete log file if required', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      target: '127.0.0.1',
      profile: 'test',
      autoParse: false,
      logDirectory: __dirname,
      deleteLogFile: true,
      onScanComplete: (scanData) => {
        // eslint-disable-next-line no-unused-expressions
        expect(fs.existsSync(scanData.logPath)).to.be.false;
        done();
      },
    });
  }).timeout(5000);

  it('should error if log file couldnt be deleted', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      deleteLogFile: true,
      onError: () => {
        done();
      },
    });

    scanner.emitScan();
  }).timeout(5000);

  it('should automagically add the -6 nmap flag if ipv6', (done) => {
    const scanner = new Scanner({ // eslint-disable-line no-unused-vars
      target: '::1',
      profile: 'test',
      autoParse: true,
      logDirectory: __dirname,
      deleteLogFile: true,
      onScanComplete: (scanData) => {
        expect(scanData.scanData.args).to.have.string(' -6 ');
        done();
      },
    });
  }).timeout(5000);

  it('should queue multiple scans', () => {
    const scanner = new Scanner({
      profile: 'test',
      autoParse: false,
    });

    let scanned127 = false;
    let scannedLocal = false;
    let localWasQueued = false;

    scanner.on('ready', () => {
      scanner.startScan('127.0.0.1');
      localWasQueued = scanner.startScan('localhost');
    });

    scanner.on('scanComplete', (scan) => {
      if (scan.target === '127.0.0.1') {
        scanned127 = true;
      }

      if (scan.target === 'localhost') {
        scannedLocal = true;
      }

      if (scanned127 && scannedLocal) {
        expect(scanned127).to.be.true // eslint-disable-line no-unused-expressions
        && expect(scannedLocal).to.be.true
        && expect(localWasQueued).to.be.true;
      }
    });
  }).timeout(10000);

  it('should autoparse by default', () => {
    const scanner = new Scanner({
      profile: 'Quick scan',
    });

    scanner.on('ready', () => {
      scanner.startScan('scanme.nmap.org');
    });

    scanner.on('scanComplete', (scan) => {
      expect(scan.scanData).to.be.an.instanceof(Object);
    });
  }).timeout(10000);
});
