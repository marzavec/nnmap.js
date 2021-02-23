const { expect } = require('chai');
const Ipidsequence = require('../src/classes/host/hostLib/Ipidsequence');

describe('Checking Ipidsequence class', () => {
  it('should be constructed', () => {
    expect(new Ipidsequence({}, {})).to.be.an.instanceof(Ipidsequence);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const ipidsequence = new Ipidsequence({}, { attrib: 'none' });

    ipidsequence.options.onError('test');
    ipidsequence.options.onWarning('test');
    ipidsequence.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const ipidsequence = new Ipidsequence({
      onError: (err) => {
        expect(err).to.have.string('Error parsing ipidsequence status data');
        done();
      },
    }, { attrib: null });

    ipidsequence.attrib = 'test';
  });
});
