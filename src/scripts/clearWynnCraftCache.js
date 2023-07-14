const { clearCache } = require('../api/wynnCraftAPI.js');
const { scriptMessage } = require('../Logger.js');
const cron = require('node-cron');

cron.schedule('*/5 * * * *', async function () {
  scriptMessage('Clearing WynnCraft Cache');
  await clearCache();
});
