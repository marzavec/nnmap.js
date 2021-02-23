const path = require('path');
const os = require('os');

const { expect } = require('chai');
const { Parser } = require('../src');
const Scan = require('../src/classes/scan/Scan');

describe('Checking Parser class', () => {
  it('should be constructed', () => {
    expect(new Parser()).to.be.an.instanceof(Parser);
  });

  it('should store logPath changes', () => {
    const parser = new Parser();
    parser.logPath = 'changed';
    expect(parser.logPath).to.be.equal('changed');
  });

  it('should clear log cache', () => {
    const parser = new Parser({
      retainParsedLogs: false,
      autoParse: true,
      logPath: path.join(__dirname, 'sampleLog.html'),
    });

    parser.clearLogs();
    expect(parser.newestScan).to.be.false; // eslint-disable-line no-unused-expressions
  });

  it('should only store X scans in memory', () => {
    const parser = new Parser({
      retainParsedLogs: true,
      maxRetainedLogs: 1,
      autoParse: false,
      logPath: path.join(__dirname, 'sampleLog.html'),
    });

    parser.startParse();

    parser.logPath = path.join(__dirname, 'partialLog.html');
    parser.startParse();

    expect(parser.scanCount).to.be.equal(1);
  });

  it('should autoparse at construction', () => {
    const parser = new Parser({
      retainParsedLogs: false,
      autoParse: true,
      logPath: path.join(__dirname, 'sampleLog.html'),
    });
    expect(parser.newestScan.data).to.be.an.instanceof(Object);
  });

  it('should autoparse on log file change', () => {
    const parser = new Parser({
      retainParsedLogs: false,
      autoParse: false,
      logPath: path.join(__dirname, 'sampleLog.html'),
    });

    parser.autoParse = true;
    parser.logPath = path.join(__dirname, 'sampleLog.html');

    expect(parser.newestScan.meta.scanner).to.be.equal('nmap');
  });

  it('should callback on processing finish', (done) => {
    const parser = new Parser({
      retainParsedLogs: false,
      autoParse: false,
      logPath: path.join(__dirname, 'sampleLog.html'),
      onParsed: (scan) => {
        expect(scan).to.be.an.instanceof(Scan);
        done();
      },
    });

    parser.startParse();
  });

  it('should emit error when missing logFile path', (done) => {
    const parser = new Parser();

    parser.on('error', (err) => {
      expect(err).to.be.instanceOf(Error);
      done();
    });

    parser.startParse();
  });

  it('should callback error when missing logFile path', (done) => {
    const parser = new Parser({
      onError: (err) => {
        expect(err).to.be.instanceOf(Error);
        done();
      },
    });

    parser.startParse();
  });

  it('should emit error when invalid logFile path', (done) => {
    const parser = new Parser({
      logPath: path.join(__dirname, '404_unicorn.html'),
    });

    parser.on('error', (err) => {
      expect(err).to.be.instanceOf(Error);
      done();
    });

    parser.startParse();
  });

  it('should fail on invalid logFile structure', (done) => {
    const parser = new Parser({
      logPath: path.join(__dirname, 'invalidLog.html'),
    });

    parser.on('error', (err) => {
      expect(err).to.be.instanceOf(Error);
      done();
    });

    parser.startParse();
  });

  it('should emit error when unable to read logFile', (done) => {
    const parser = new Parser({
      logPath: os.tmpdir(),
    });

    parser.on('error', (err) => {
      expect(err).to.be.instanceOf(Error);
      done();
    });

    parser.startParse();
  });

  it('should emit warning, but continue, when logFile is invalid', (done) => {
    const partialLogPath = path.join(__dirname, 'partialLog.html');
    const parser = new Parser({
      logPath: partialLogPath,
    });

    parser.on('warning', (warn) => {
      expect(warn).to.be.equal(`Non-critical Warning: Cannot validate target log file: ${partialLogPath}`);
      done();
    });

    parser.startParse();
  });

  it('should callback a warning, but continue, when logFile is invalid', (done) => {
    const partialLogPath = path.join(__dirname, 'partialLog.html');
    const parser = new Parser({
      onWarning: (warn) => {
        expect(warn).to.be.equal(`Non-critical Warning: Cannot validate target log file: ${partialLogPath}`);
        done();
      },
      logPath: partialLogPath,
    });

    parser.startParse();
  });

  it('should emit a debug message', (done) => {
    let isDone = false;
    const parser = new Parser({
      debug: true,
      logPath: path.join(__dirname, 'cornerCases.html'),
    });

    parser.on('error', () => {});

    parser.on('debug', (debug) => {
      expect(debug).to.have.string('Unknown property');
      if (!isDone) {
        done();
        isDone = true;
      }
    });

    parser.startParse();
  });

  it('should callback a debug message', (done) => {
    let isDone = false;
    const parser = new Parser({
      debug: true,
      onError: () => {},
      onDebug: (debug) => {
        expect(debug).to.have.string('Unknown property');
        if (!isDone) {
          done();
          isDone = true;
        }
      },
      logPath: path.join(__dirname, 'cornerCases.html'),
    });

    parser.startParse();
  });

  it('should only debug when requested', (done) => {
    let emitted = false;
    const parser = new Parser({
      debug: false,
      logPath: path.join(__dirname, 'cornerCases.html'),
    });

    parser.on('error', () => {});

    parser.on('debug', () => {
      emitted = true;
    });

    setTimeout(() => {
      expect(emitted).to.be.false; // eslint-disable-line no-unused-expressions
      done();
    }, 45);

    parser.startParse();
  });
});
