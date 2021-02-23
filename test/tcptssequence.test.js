const { expect } = require('chai');
const Tcptssequence = require('../src/classes/host/hostLib/Tcptssequence');

describe('Checking Tcptssequence class', () => {
  it('should be constructed', () => {
    expect(new Tcptssequence({}, {})).to.be.an.instanceof(Tcptssequence);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const tcpss = new Tcptssequence({}, { attrib: 'none' });

    tcpss.options.onError('test');
    tcpss.options.onWarning('test');
    tcpss.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const tcpss = new Tcptssequence({
      onError: (err) => {
        expect(err).to.have.string('Error parsing tcp s sequence data');
        done();
      },
    }, { attrib: null });

    tcpss.attrib = 'test';
  });
});
