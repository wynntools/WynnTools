const { clearDiscordCache } = require('../api/discordAPI.js');
const { scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const cron = require('node-cron');

var timezoneStuff = { scheduled: true };
if (!config.other.timezone == null) timezoneStuff = { scheduled: true, timezone: config.other.timezone };

cron.schedule(
  '00 12 * * *',
  async function () {
    scriptMessage('Clearing Discord Cache');
    await clearDiscordCache();
  },
  timezoneStuff
);
