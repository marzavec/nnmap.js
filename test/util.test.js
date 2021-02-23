const { expect } = require('chai');
const Util = require('../src/classes/utility/Util');

const defaultOpts = {
  str: 'string',
  obj: {
    nested: 'obj',
  },
};

describe('Checking static Util class', () => {
  it('should not be constructed', () => {
    expect(() => { const err = new Util(); return err; }).to.throw();
  });

  it('should fill in the blanks', () => {
    const opts = Util.mergeDefault(defaultOpts, null);
    expect(opts.str).to.be.equal('string');
  });

  it('should not override defaults', () => {
    const opts = Util.mergeDefault({
      str: 'replaced',
    }, defaultOpts);
    expect(opts.str).to.be.equal('string');
  });

  it('should add missing values', () => {
    const opts = Util.mergeDefault({
      miss: 'ing',
    }, defaultOpts);
    expect(opts.miss).to.be.equal('ing');
  });

  it('should recursively check objects', () => {
    const opts = Util.mergeDefault({}, defaultOpts);
    expect(opts.obj.nested).to.be.equal('obj');
  });
});
