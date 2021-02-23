const { expect } = require('chai');
const Uptime = require('../src/classes/host/hostLib/Uptime');

describe('Checking Uptime class', () => {
  it('should be constructed', () => {
    expect(new Uptime({}, {})).to.be.an.instanceof(Uptime);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const uptime = new Uptime({}, { attrib: 'none' });

    uptime.options.onError('test');
    uptime.options.onWarning('test');
    uptime.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const uptime = new Uptime({
      onError: (err) => {
        expect(err).to.have.string('Error parsing uptime data');
        done();
      },
    }, { attrib: null });

    uptime.attrib = 'test';
  });
});
