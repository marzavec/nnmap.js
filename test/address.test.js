const { expect } = require('chai');
const Address = require('../src/classes/host/hostLib/Address');

describe('Checking Address class', () => {
  it('should be constructed', () => {
    expect(new Address({}, {})).to.be.an.instanceof(Address);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const address = new Address({}, { attrib: 'none' });

    address.options.onError('test');
    address.options.onWarning('test');
    address.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const address = new Address({
      onError: (err) => {
        expect(err).to.have.string('Error parsing address data');
        done();
      },
    }, { attrib: null });

    address.attrib = 'test';
  });
});
