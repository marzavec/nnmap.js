const { expect } = require('chai');
const Script = require('../src/classes/host/hostLib/Script');

describe('Checking Script class', () => {
  it('should be constructed', () => {
    expect(new Script({}, {})).to.be.an.instanceof(Script);
  });

  it('should accept missing error, warn and debug functions', (done) => {
    const script = new Script({}, { attrib: 'none' });

    script.options.onError('test');
    script.options.onWarning('test');
    script.options.onDebug('test');

    done();
  });

  it('should callback error when it fails structure parsing', (done) => {
    const script = new Script({
      onError: (err) => {
        expect(err).to.have.string('Error parsing host script data');
        done();
      },
    }, { attrib: null });

    script.attrib = 'test';
  });

  it('should handle unexpected types', () => {
    const script = new Script({}, {});

    script.elem = undefined;
    script.elem = {};
    script.table = {};
  });
});
