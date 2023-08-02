const { getServers } = require('../api/wynnCraftAPI.js');
const { scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const cron = require('node-cron');

var timezoneStuff = { scheduled: true };
if (!config.other.timezone == null) timezoneStuff = { scheduled: true, timezone: config.other.timezone };

cron.schedule(
  '*/5 * * * *',
  async function () {
    try {
      scriptMessage('Updating Server Player Counts');
      await getServers();
    } catch (error) {
      console.log(error);
    }
  },
  timezoneStuff
);
