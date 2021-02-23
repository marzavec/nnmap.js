const { expect } = require('chai');
const Scan = require('../src/classes/scan/Scan');

describe('Checking Scan class', () => {
  it('should be constructed', () => {
    expect(new Scan({}, { nmaprun: { attrib: 'none' } })).to.be.an.instanceof(Scan);
  });

  it('should callback error when it fails structure parsing', (done) => {
    const scan = new Scan({
      onError: (err) => {
        expect(err).to.have.string('Error parsing scan log');
        done();
      },
    }, { nmaprun: { attrib: null } });

    scan.runstats = scan.data;
  });

  it('should return an empty object if hosts failed to parse', () => {
    const scan = new Scan({}, { nmaprun: { attrib: 'none' } });

    scan.hosts = [{ }];

    scan.runstats = '';

    expect(scan.data.hosts[0]).to.be.empty; // eslint-disable-line no-unused-expressions
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const scan = new Scan({}, { nmaprun: { attrib: 'none' } });

    scan.options.onError('test');
    scan.options.onWarning('test');
    scan.options.onDebug('test');

    done();
  });
});
