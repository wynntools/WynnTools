/* eslint-disable no-undef */
const {
  discordMessage,
  commandMessage,
  warnMessage,
  errorMessage,
  scriptMessage,
  cacheMessage,
} = require('../../src/functions/logger.js');
const { getCurrentTime } = require('../../src/functions/helper.js');
const { expect } = require('chai');
const cli = require('cli-color');
const sinon = require('sinon');

describe('Logging Functions', () => {
  let consoleLogStub;

  beforeEach(() => {
    consoleLogStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    consoleLogStub.restore();
  });

  it('should log a Discord message', () => {
    const message = 'Test Discord Message';
    const expectedLog = `${cli.bgMagenta.black(`[${getCurrentTime()}] Discord >`)} ${cli.magenta(message)}`;

    discordMessage(message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });

  it('should log a command message', () => {
    const message = 'Test Command Message';
    const expectedLog = `${cli.bgGreenBright.black(`[${getCurrentTime()}] Command >`)} ${cli.greenBright(message)}`;

    commandMessage(message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });

  it('should log a warning message', () => {
    const message = 'Test Warning Message';
    const expectedLog = `${cli.bgGreenBright.black(`[${getCurrentTime()}] Warning >`)} ${cli.yellow(message)}`;

    warnMessage(message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });

  it('should log an error message', () => {
    const message = 'Test Error Message';
    const expectedLog = `${cli.bgRedBright.black(`[${getCurrentTime()}] Error >`)} ${cli.redBright(message)}`;

    errorMessage(message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });

  it('should log a script message', () => {
    const message = 'Test Script Message';
    const expectedLog = `${cli.bgCyan.black(`[${getCurrentTime()}] Scripts >`)} ${cli.cyan(message)}`;

    scriptMessage(message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });

  it('should log a cache message', () => {
    const type = 'TestType';
    const message = 'Test Cache Message';
    const expectedLog = `${cli.bgYellow.black(`[${getCurrentTime()}] ${type} Cache >`)} ${cli.yellow(message)}`;

    cacheMessage(type, message);

    expect(consoleLogStub.calledOnce).to.be.true;
    expect(consoleLogStub.args[0][0]).to.equal(expectedLog);
  });
});
