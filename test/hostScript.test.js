const { expect } = require('chai');
const HostScript = require('../src/classes/host/hostLib/HostScript');

describe('Checking HostScript class', () => {
  it('should be constructed', () => {
    expect(new HostScript({}, {})).to.be.an.instanceof(HostScript);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const hostScript = new HostScript({}, { attrib: 'none' });

    hostScript.options.onError('test');
    hostScript.options.onWarning('test');
    hostScript.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const hostScript = new HostScript({
      onError: (err) => {
        expect(err).to.have.string('Error parsing host script data');
        done();
      },
    }, { attrib: null });

    hostScript.attrib = 'test';
  });

  it('should handle unexpected types', () => {
    const hostScript = new HostScript({}, {});

    hostScript.scripts = [{}];
    hostScript.script = hostScript.data;
  });
});
