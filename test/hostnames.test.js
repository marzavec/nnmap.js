const { expect } = require('chai');
const Hostnames = require('../src/classes/host/hostLib/Hostnames');

describe('Checking Hostnames class', () => {
  it('should be constructed', () => {
    expect(new Hostnames({}, {})).to.be.an.instanceof(Hostnames);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const hostnames = new Hostnames({}, { attrib: 'none' });

    hostnames.options.onError('test');
    hostnames.options.onWarning('test');
    hostnames.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const hostnames = new Hostnames({
      onError: (err) => {
        expect(err).to.have.string('Error parsing hostname data');
        done();
      },
    }, { attrib: null });

    hostnames.attrib = 'test';
  });
});
