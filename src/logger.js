var { getCurrentTime } = require('./helperFunctions.js');
var cli = require('cli-color');

function discordMessage(message) {
  return console.log(cli.bgMagenta.black(`[${getCurrentTime()}] Discord >`) + ' ' + cli.magenta(message));
}

function commandMessage(message) {
  return console.log(cli.bgGreenBright.black(`[${getCurrentTime()}] Command >`) + ' ' + cli.greenBright(message));
}

function warnMessage(message) {
  return console.log(cli.bgGreenBright.black(`[${getCurrentTime()}] Warning >`) + ' ' + cli.yellow(message));
}

function errorMessage(message) {
  return console.log(cli.bgRedBright.black(`[${getCurrentTime()}] Error >`) + ' ' + cli.redBright(message));
}

function scriptMessage(message) {
  return console.log(cli.bgCyan.black(`[${getCurrentTime()}] Scripts >`) + ' ' + cli.cyan(message));
}

function cacheMessage(type, message) {
  return console.log(cli.bgYellow.black(`[${getCurrentTime()}] ${type} Cache >`) + ' ' + cli.yellow(message));
}

module.exports = { discordMessage, commandMessage, warnMessage, errorMessage, scriptMessage, cacheMessage };
