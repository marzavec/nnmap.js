const { expect } = require('chai');
const Tcpsequence = require('../src/classes/host/hostLib/Tcpsequence');

describe('Checking Tcpsequence class', () => {
  it('should be constructed', () => {
    expect(new Tcpsequence({}, {})).to.be.an.instanceof(Tcpsequence);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const tcps = new Tcpsequence({}, { attrib: 'none' });

    tcps.options.onError('test');
    tcps.options.onWarning('test');
    tcps.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const tcps = new Tcpsequence({
      onError: (err) => {
        expect(err).to.have.string('Error parsing tcp sequence data');
        done();
      },
    }, { attrib: null });

    tcps.attrib = 'test';
  });
});
