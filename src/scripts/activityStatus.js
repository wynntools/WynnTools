const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { scriptMessage } = require('../logger.js');
const { ActivityType } = require('discord.js');
const path = require('path');
const fs = require('fs');

async function run() {
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
