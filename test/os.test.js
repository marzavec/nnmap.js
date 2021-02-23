const { expect } = require('chai');
const Os = require('../src/classes/host/hostLib/Os');

describe('Checking Os class', () => {
  it('should be constructed', () => {
    expect(new Os({}, {})).to.be.an.instanceof(Os);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const os = new Os({}, { attrib: 'none' });

    os.options.onError('test');
    os.options.onWarning('test');
    os.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const os = new Os({
      onError: (err) => {
        expect(err).to.have.string('Error parsing host os data');
        done();
      },
    }, { attrib: null });

    os.attrib = 'test';
  });

  it('should handle unexpected types', () => {
    const os = new Os({}, {});

    os.osMatchs = [{}];
    os.portused = {};
    os.test = os.data;
  });
});
