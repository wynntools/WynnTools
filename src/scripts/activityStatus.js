const { scriptMessage } = require('../logger.js');
const { ActivityType } = require('discord.js');
const config = require('../../config.json');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

var timezoneStuff = { scheduled: true };
if (!config.other.timezone == null) timezoneStuff = { scheduled: true, timezone: config.other.timezone };

var num = 0;

const commands = [];
fs.readdirSync(path.resolve(__dirname, '../commands/general')).forEach((file) => {
  if (!file.endsWith('.js')) return;
  commands.push(file);
});

client.user.setPresence({
  activities: [{ name: 'to crys', type: ActivityType.Listening }],
});

var activities = [
  { id: 'servers', title: `to ${client.guilds.cache.size} servers!` },
  { id: 'ping', title: `to ${client.ws.ping}ms of ping!` },
  { id: 'commands', title: `to ${commands.length} commands!` },
];

cron.schedule(
  '*/5 * * * *',
  async function () {
    scriptMessage(`Changing activity status - ${activities[num].id}`);
    client.user.setPresence({
      activities: [{ name: activities[num].title, type: ActivityType.Listening }],
    });
    num++;
    if (num == activities.length) num = 0;
  },
  timezoneStuff
);
