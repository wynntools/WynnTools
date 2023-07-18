const { clearMojangCache } = require('../api/mojangAPI.js');
const { scriptMessage } = require('../logger.js');
const cron = require('node-cron');

cron.schedule('00 12 * * *', async function () {
  scriptMessage('Clearing Mojang Cache');
  await clearMojangCache();
});
