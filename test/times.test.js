const { expect } = require('chai');
const Times = require('../src/classes/host/hostLib/Times');

describe('Checking Times class', () => {
  it('should be constructed', () => {
    expect(new Times({}, {})).to.be.an.instanceof(Times);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const times = new Times({}, { attrib: 'none' });

    times.options.onError('test');
    times.options.onWarning('test');
    times.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const times = new Times({
      onError: (err) => {
        expect(err).to.have.string('Error parsing timing data');
        done();
      },
    }, { attrib: null });

    times.attrib = 'test';
  });
});
