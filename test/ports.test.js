const { expect } = require('chai');
const Ports = require('../src/classes/host/hostLib/Ports');

describe('Checking Ports class', () => {
  it('should be constructed', () => {
    expect(new Ports({}, {})).to.be.an.instanceof(Ports);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const ports = new Ports({}, { attrib: 'none' });

    ports.options.onError('test');
    ports.options.onWarning('test');
    ports.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const ports = new Ports({
      onError: (err) => {
        expect(err).to.have.string('Error parsing port data');
        done();
      },
    }, { attrib: null });

    ports.attrib = 'test';
  });

  it('should handle unexpected types', () => {
    const ports = new Ports({}, {});

    ports.portArray = [{}];
    ports.port = {};
    ports.addPortMeta(ports.data);
  });
});
