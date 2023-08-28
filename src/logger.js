// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Logger.js (Edited)
var { getCurrentTime } = require('./functions/helper.js');
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

async function updateMessage() {
  const columns = process.stdout.columns;
  const warning = 'IMPORTANT!';
  const message2 = 'Bot has updated, please restart the bot to apply changes!';
  const padding = ' '.repeat(Math.floor((columns - warning.length) / 2));
  const padding2 = ' '.repeat(Math.floor((columns - message2.length) / 2));
  console.log(cli.bgRed.black(padding + warning + padding + '\n' + padding2 + message2 + padding2));
}

module.exports = {
  discordMessage,
  commandMessage,
  warnMessage,
  errorMessage,
  scriptMessage,
  cacheMessage,
  updateMessage,
};
