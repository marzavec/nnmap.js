const { expect } = require('chai');
const PortData = require('../src/classes/host/hostLib/PortData');

describe('Checking PortData class', () => {
  it('should be constructed', () => {
    expect(new PortData({}, {})).to.be.an.instanceof(PortData);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const portData = new PortData({}, { attrib: 'none' });

    portData.options.onError('test');
    portData.options.onWarning('test');
    portData.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const portData = new PortData({
      onError: (err) => {
        expect(err).to.have.string('Error parsing port data');
        done();
      },
    }, { attrib: null });

    portData.attrib = 'test';
  });

  it('should handle unexpected types', () => {
    const portData = new PortData({}, {});

    portData.state = {};
    portData.scripts = [{}];
    portData.test = portData.data;
  });
});
