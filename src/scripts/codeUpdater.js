// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Updater.js (Edited)
const { updateMessage, scriptMessage, errorMessage } = require('../functions/logger.js');
const config = require('../../config.json');
const { exec } = require('child_process');
const cron = require('node-cron');

module.exports = {
  config: {
    running: false,
    enabled: true,
    type: 'cron',
    name: 'codeUpdateChecker',
    description: 'Checks for new code updates every 6 hours',
    timesRun: 0,
  },
  task: cron.schedule(
    '0 */6 * * *',
    function () {
      scriptMessage('Checking for Code updates.');
      exec('git pull', (error, stdout, stderr) => {
        if (error) {
          errorMessage(`Git pull error: ${error}`);
          return;
        }
        if (stdout === 'Already up to date.\n') {
          return scriptMessage('Code is already up to date.');
        }
        updateMessage();
      });
      this.config.timesRun++;
    },
    {
      scheduled: false,
      timezone: config.other.timezone ? config.other.timezone : null,
    }
  ),
};
