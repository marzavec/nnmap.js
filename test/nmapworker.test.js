const { expect } = require('chai');
const NmapWorker = require('../src/classes/worker/NmapWorker');

describe('Checking NmapWorker class', () => {
  it('should be constructed', () => {
    expect(new NmapWorker()).to.be.an.instanceof(NmapWorker);
  });

  it('should create a worker with default event handlers', (done) => {
    const worker = new NmapWorker();

    worker.options.onError();
    worker.options.onWarning();
    worker.options.onDebug();
    worker.options.onReady();
    worker.options.onFinish();
    worker.options.onNmapOut();

    done();
  });

  it('should accept options', () => {
    const worker = new NmapWorker({
      logDirectory: '/home/unit/tests/suck',
      profile: 'Intense scan plus UDP',
    });

    expect(worker.logDirectory).to.include('/home/unit/tests/suck');
  });

  it('should split command arguments correctly', () => {
    // const worker = new NmapWorker();
    const argStr = '-v -x "-z" -0';
    expect(NmapWorker.stringToArgs(argStr)).to.include('-x');
  });

  it('should not fail startup checks', async () => {
    const worker = new NmapWorker({
      skipChecks: true,
    });

    const res = await worker.runChecks();
    expect(res).to.equal(true);
  });

  it('should report issues running nmap', (done) => {
    const worker = new NmapWorker({
      nmapPath: '/none',
      skipChecks: true,
      onError: () => {
        done();
      },
    });

    worker.runNmap = async () => {
      throw new Error('An unit test occurred');
    };

    worker.runChecks();
  });

  it('should accept spaces in log path', async () => {
    const worker = new NmapWorker({
      nmapPath: '/none',
      logDirectory: '/home/this path/doesnt/exist',
      skipChecks: true,
    });

    worker.isWin = false;

    worker.runNmap({
      target: '',
      args: '-V',
      logPath: '/home/this path/doesnt/exist',
    });

    expect(worker.logDirectory).to.include('/home/this path/doesnt/exist');
  });

  it('should catch failed scans', (done) => {
    const worker = new NmapWorker({
      nmapPath: '/none',
      skipChecks: true,
      onError: () => {
        done();
      },
    });

    worker.runNmap = async () => {
      throw new Error('An unit test occurred');
    };

    worker.scan({
      target: '',
      args: '-V',
      logPath: '/home/this path/doesnt/exist',
    });
  });
});
