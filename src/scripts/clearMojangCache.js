const { clearCache } = require('../api/mojangAPI.js');
const { scriptMessage } = require('../Logger.js');
const cron = require('node-cron');

cron.schedule('00 12 * * *', async function () {
  scriptMessage('Clearing Mojang Cache');
  await clearCache();
});
