const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { countStatsInDirectory, addNotation, generateID } = require('../functions/helper.js');
const { scriptMessage, errorMessage } = require('../functions/logger.js');
const packageJson = require('../../package.json');
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

cron.schedule(
  '*/5 * * * *',
  async function () {
    try {
      scriptMessage('Updating stats embed/message');
      const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());
      const channel = await client.channels.fetch(config.discord.channels.stats);
      const message = await channel.messages.fetch(config.discord.messages.stats);
      var userData = JSON.parse(fs.readFileSync('data/userData.json'));
      var totalCommandsRun = 0;
      for (const entry in userData) {
        totalCommandsRun += userData[entry].commandsRun;
      }
      const genCommands = [];
      fs.readdirSync(path.resolve(__dirname, '../commands/general')).forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        genCommands.push(file);
      });
      const devCommands = [];
      fs.readdirSync(path.resolve(__dirname, '../commands/dev')).forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        devCommands.push(file);
      });
      const invite = new ButtonBuilder().setLabel('invite').setURL(config.discord.botInvite).setStyle(ButtonStyle.Link);
      const source = new ButtonBuilder()
        .setLabel('source')
        .setURL('https://github.com/Kathund/WynnTools')
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(invite, source);
      var embed = new EmbedBuilder()
        .setTitle(`WynnTools Stats`)
        .setColor(config.discord.embeds.green)
        .setTimestamp()
        .addFields(
          {
            name: 'General',
            value: `<:Dev:1130772126769631272> Developer - \`@kathund\`\n<:commands:1130772895891738706> Commands - \`${
              genCommands.length
            } (${
              devCommands.length
            } dev commands)\`\n<:commands:1130772895891738706> Total Commands Run - \`${totalCommandsRun}\`\n<:bullet:1064700156789927936> Version \`${
              packageJson.version
            }\`\nServers - \`${await client.guilds.cache.size}\`\nUptime - <t:${global.uptime}:R>`,
            inline: true,
          },
          {
            name: 'Code Stats',
            value: `Files - \`${addNotation('oneLetters', totalFiles)}\`\nLines - \`${addNotation(
              'oneLetters',
              totalLines
            )}\`\nCharacters - \`${addNotation(
              'oneLetters',
              totalCharacters
            )}\`\nCharacters with out spaces - \`${addNotation('oneLetters', totalCharacters - totalWhitespace)}\``,
            inline: true,
          }
        )
        .setFooter({
          text: `by @kathund | Stats maybe inaccurate/outdated/cached`,
          iconURL: config.other.logo,
        });
      await message.edit({ embeds: [embed], components: [row] });
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error Id - ${errorId}`);
      console.log(error);
    }
  },
  timezoneStuff
);
