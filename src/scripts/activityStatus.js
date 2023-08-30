const packageJson = require('../../package.json');
const { scriptMessage } = require('../functions/logger.js');
const { ActivityType } = require('discord.js');
const config = require('../../config.json');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

let timezoneStuff = null;
if (config.other.timezone == null) {
  timezoneStuff = { scheduled: true };
} else {
  timezoneStuff = { scheduled: true, timezone: config.other.timezone };
}

var num = 0;
const commands = [];
fs.readdirSync(path.resolve(__dirname, '../commands/general')).forEach((file) => {
  if (!file.endsWith('.js')) return;
  commands.push(file);
});
client.user.setPresence({ activities: [{ name: 'to crys', type: ActivityType.Listening }] });
var activities = [
  { id: 'servers', title: `over ${client.guilds.cache.size} servers!`, type: 'Watching' },
  { id: 'commands', title: `${commands.length} commands!`, type: 'Watching' },
  { id: 'totalCommands', type: 'Listening' },
  { id: 'users', type: 'Watching' },
  { id: 'version', title: `version ${packageJson.version}!`, type: 'Playing' },
];
cron.schedule(
  '*/5 * * * *',
  async function () {
    scriptMessage(`Changing activity status - ${activities[num].id}`);
    let userData;
    let totalCommandsRun;
    let totalUsers;
    if (activities[num].id === 'totalCommands') {
      userData = JSON.parse(fs.readFileSync('data/userData.json'));
      totalCommandsRun = 0;
      for (const entry in userData) {
        totalCommandsRun += userData[entry].commandsRun;
      }
      client.user.setPresence({
        activities: [
          {
            name: `to ${totalCommandsRun} Total Commands Run`,
            type: ActivityType[activities[num].type],
          },
        ],
      });
    } else if (activities[num].id === 'users') {
      userData = Object.keys(JSON.parse(fs.readFileSync('data/userData.json')));
      totalUsers = userData.length;
      client.user.setPresence({
        activities: [{ name: `${totalUsers} Total Users! `, type: ActivityType[activities[num].type] }],
      });
    } else {
      client.user.setPresence({
        activities: [{ name: activities[num].title, type: ActivityType[activities[num].type] }],
      });
    }
    num++;
    if (num == activities.length) num = 0;
  },
  timezoneStuff
);
