const { clearDiscordCache } = require('../api/discordAPI.js');
const { scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const cron = require('node-cron');

module.exports = {
  config: {
    running: false,
    enabled: false,
    type: 'cron',
    name: 'clearDiscordCache',
  },
  task: cron.schedule(
    '00 12 * * *',
    async function () {
      scriptMessage('Clearing Discord Cache');
      await clearDiscordCache();
    },
    {
      scheduled: false,
      timezone: config.other.timezone ? config.other.timezone : null,
    }
  ),
};
