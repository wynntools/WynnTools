const { clearDiscordCache } = require('../api/discordAPI.js');
const { scriptMessage } = require('../logger.js');
const cron = require('node-cron');

cron.schedule('00 12 * * *', async function () {
  scriptMessage('Clearing Discord Cache');
  await clearDiscordCache();
});
