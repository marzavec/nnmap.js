const { expect } = require('chai');
const Distance = require('../src/classes/host/hostLib/Distance');

describe('Checking Distance class', () => {
  it('should be constructed', () => {
    expect(new Distance({}, {})).to.be.an.instanceof(Distance);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const distance = new Distance({}, { attrib: 'none' });

    distance.options.onError('test');
    distance.options.onWarning('test');
    distance.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const distance = new Distance({
      onError: (err) => {
        expect(err).to.have.string('Error parsing distance data');
        done();
      },
    }, { attrib: null });

    distance.attrib = 'test';
  });
});
