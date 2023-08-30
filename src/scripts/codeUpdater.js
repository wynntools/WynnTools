// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Updater.js (Edited)
const { updateMessage, scriptMessage } = require('../functions/logger.js');
const { exec } = require('child_process');
const cron = require('node-cron');

cron.schedule('0 */6 * * *', function () {
  scriptMessage('Checking for Code updates.');
  exec('git pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`Git pull error: ${error}`);
      return;
    }
    if (stdout === 'Already up to date.\n') {
      return scriptMessage('Code is already up to date.');
    }
    updateMessage();
  });
});
