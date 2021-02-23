const { expect } = require('chai');
const Status = require('../src/classes/host/hostLib/Status');

describe('Checking Tcpsequence class', () => {
  it('should be constructed', () => {
    expect(new Status({}, {})).to.be.an.instanceof(Status);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const status = new Status({}, { attrib: 'none' });

    status.options.onError('test');
    status.options.onWarning('test');
    status.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const status = new Status({
      onError: (err) => {
        expect(err).to.have.string('Error parsing status status data');
        done();
      },
    }, { attrib: null });

    status.attrib = 'test';
  });
});
