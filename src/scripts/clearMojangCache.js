const { clearMojangCache } = require('../api/mojangAPI.js');
const { scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const cron = require('node-cron');

module.exports = {
  config: {
    running: false,
    enabled: false,
    type: 'cron',
    name: 'clearMojangCache',
  },
  task: cron.schedule(
    '00 12 * * *',
    async function () {
      scriptMessage('Clearing Mojang Cache');
      await clearMojangCache();
    },
    {
      scheduled: false,
      timezone: config.other.timezone ? config.other.timezone : null,
    }
  ),
};
