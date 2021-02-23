const { expect } = require('chai');
const Trace = require('../src/classes/host/hostLib/Trace');

describe('Checking Trace class', () => {
  it('should be constructed', () => {
    expect(new Trace({}, {})).to.be.an.instanceof(Trace);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const trace = new Trace({}, { attrib: 'none' });

    trace.options.onError('test');
    trace.options.onWarning('test');
    trace.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const trace = new Trace({
      onError: (err) => {
        expect(err).to.have.string('Error parsing trace data');
        done();
      },
    }, { attrib: null });

    trace.addHop('test');
  });
});
