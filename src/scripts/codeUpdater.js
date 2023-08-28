// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Updater.js (Edited)
const { updateMessage, scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const { exec } = require('child_process');
const cron = require('node-cron');

module.exports = {
  config: {
    running: false,
    enabled: false,
    type: 'cron',
    name: 'codeUpdateChecker',
  },
  task: cron.schedule(
    '0 */6 * * *',
    function () {
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
    },
    {
      scheduled: false,
      timezone: config.other.timezone ? config.other.timezone : null,
    }
  ),
};
