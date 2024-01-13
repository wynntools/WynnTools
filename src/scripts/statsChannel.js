const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { scriptMessage, errorMessage } = require('../functions/logger.js');
const { generateID } = require('../functions/helper.js');
const packageJson = require('../../package.json');
const config = require('../../config.json');
const cron = require('node-cron');
const fs = require('fs');

let timezoneStuff = null;
if (config.other.timezone == null) {
  timezoneStuff = { scheduled: true };
} else {
  timezoneStuff = { scheduled: true, timezone: config.other.timezone };
}

cron.schedule(
  '*/5 * * * *',
  async function () {
    try {
      if (config.other.devMode) return scriptMessage('Dev mode enabled - not updating stats embed/message');
      scriptMessage('Updating stats embed/message');
      const channel = await client.channels.fetch(config.discord.channels.stats);
      const message = await channel.messages.fetch(config.discord.messages.stats);
      var userData = JSON.parse(fs.readFileSync('data/userData.json'));
      var totalCommandsRun = 0;
      for (const entry in userData) {
        totalCommandsRun += userData[entry].commandsRun;
      }
      const genCommands = [];
      fs.readdirSync('./src/commands/general').forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        genCommands.push(file);
      });
      const devCommands = [];
      fs.readdirSync('./src/commands/dev').forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        devCommands.push(file);
      });
      const invite = new ButtonBuilder().setLabel('invite').setURL(config.discord.botInvite).setStyle(ButtonStyle.Link);
      const source = new ButtonBuilder()
        .setLabel('source')
        .setURL('https://github.com/WynnTools/WynnTools')
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(invite, source);
      var embed = new EmbedBuilder()
        .setTitle(`WynnTools Stats`)
        .setColor(config.other.colors.green)
        .setTimestamp()
        .addFields({
          name: 'General',
          value: `<:Dev:${config.other.emojis.dev}> Developer - \`@kathund.\`\n<:commands:${
            config.other.emojis.commands
          }> Commands - \`${genCommands.length} (${devCommands.length} dev commands)\`\n<:commands:${
            config.other.emojis.commands
          }> Total Commands Run - \`${totalCommandsRun}\`\n<:bullet:${config.other.emojis.bullet}> Version \`${
            packageJson.version
          }\`\n<:bullet:${config.other.emojis.bullet}> Servers - \`${await client.guilds.cache.size}\`\n<:bullet:${
            config.other.emojis.bullet
          }> Uptime - <t:${global.uptime}:R>`,
          inline: true,
        })
        .setFooter({
          text: `by @kathund. | Stats maybe inaccurate/outdated/cached`,
          iconURL: config.other.logo,
        });
      await message.edit({ embeds: [embed], components: [row] });
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error Id - ${errorId}`);
      errorMessage(error);
    }
  },
  timezoneStuff
);
