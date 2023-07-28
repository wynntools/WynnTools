const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { scriptMessage } = require('../logger.js');
const { ActivityType } = require('discord.js');
const config = require('../../config.json');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

var timezoneStuff = { scheduled: true };
if (!config.other.timezone == null) timezoneStuff = { scheduled: true, timezone: config.other.timezone };

var task = cron.schedule(
  '*/5 * * * *',
  async function () {
    run();
  },
  timezoneStuff
);

async function run() {
  task.stop();
  const commands = [];
  fs.readdirSync(path.resolve(__dirname, '../commands/general')).forEach((file) => {
    if (!file.endsWith('.js')) return;
    commands.push(file);
  });

  while (true) {
    scriptMessage('Changing activity status - To Servers');
    client.user.setPresence({
      activities: [{ name: `to ${client.guilds.cache.size} servers!`, type: ActivityType.Listening }],
    });
    await delay(5 * 60_000); // 60 000 milliseconds = 1 minute
    scriptMessage('Changing activity status - To Commands');
    client.user.setPresence({
      activities: [{ name: `to ${commands.length} commands!`, type: ActivityType.Listening }],
    });
    await delay(5 * 60_000); // 60 000 milliseconds = 1 minute
    scriptMessage('Changing activity status - To Ping');
    client.user.setPresence({
      activities: [{ name: `to ${client.ws.ping}ms of ping!`, type: ActivityType.Listening }],
    });
    await delay(5 * 60_000); // 60 000 milliseconds = 1 minute
  }
}
run();
