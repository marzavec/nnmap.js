const { expect } = require('chai');
const { Scanner, Parser } = require('../src');

describe('Checking index', () => {
  it('should export `Scanner`', () => {
    expect(Scanner).to.not.be.equal('undefined');
  });

  it('should export `Parser`', () => {
    expect(Parser).to.not.be.equal('undefined');
  });
});
