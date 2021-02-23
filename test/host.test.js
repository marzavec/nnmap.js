const { expect } = require('chai');
const Host = require('../src/classes/host/Host');

describe('Checking Host class', () => {
  it('should be constructed', () => {
    expect(new Host({}, {})).to.be.an.instanceof(Host);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const host = new Host({}, { attrib: 'none' });

    host.options.onError('test');
    host.options.onWarning('test');
    host.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const host = new Host({
      onError: (err) => {
        expect(err).to.have.string('Error parsing host data');
        done();
      },
    }, { attrib: null });

    host.attrib = 'test';
  });
});
