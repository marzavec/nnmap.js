const util = require('util');
const { Scanner } = require('./src');

const scanner = new Scanner({
  debug: true,
  autoParse: true,
});

scanner.on('error', (err) => {
  console.log(err); // eslint-disable-line no-console
});

scanner.on('debug', (err) => {
  console.log(err); // eslint-disable-line no-console
});

scanner.on('ready', () => {
  console.log('Scanner ready'); // eslint-disable-line no-console
  scanner.startScan('scanme.nmap.org');
  // scanner.startScan('192.168.1.1', 'Slow comprehensive scan');
});

scanner.on('scanQueued', (scan) => {
  console.log('scanQueued:'); // eslint-disable-line no-console
  console.log(scan); // eslint-disable-line no-console
});

scanner.on('scanStarted', (scan) => {
  console.log('scanStarted:'); // eslint-disable-line no-console
  console.log(scan); // eslint-disable-line no-console
  // setTimeout(() => console.log(scanner.killScan()), 3000);
});

scanner.on('scanAborted', (scan) => {
  console.log('scanAborted:'); // eslint-disable-line no-console
  console.log(scan); // eslint-disable-line no-console
});

scanner.on('scanComplete', (scan) => {
  console.log('scanComplete:'); // eslint-disable-line no-console
  console.log(util.inspect(scan, false, null, true)); // eslint-disable-line no-console
});

scanner.on('nmapOut', (line) => {
  console.log('nmap output:'); // eslint-disable-line no-console
  console.log(line); // eslint-disable-line no-console
});

/*
const util = require('util');
const path = require('path');
const { Parser } = require('./src');

//const testLogPath = path.join(__dirname, 'test', 'sampleLog.html');
const testLogPath = 'C:\\Users\\Owner\\AppData\\Local\\Temp\\lxg4hsfajk.html';

const finishedParsing = (scan) => {
  console.log(util.inspect(scan.data, false, null, true)); // eslint-disable-line no-console
};

const parser = new Parser({
  debug: true,
  onParsed: finishedParsing,
  logPath: testLogPath
});

parser.on('error', (err) => {
  console.log(err); // eslint-disable-line no-console
});

parser.on('warning', (warn) => {
  console.log(warn); // eslint-disable-line no-console
});

parser.on('debug', (debug) => {
  console.log(debug); // eslint-disable-line no-console
});

try {
  parser.startParse();
} catch (err) {
  console.log(err); // eslint-disable-line no-console
}
*/
