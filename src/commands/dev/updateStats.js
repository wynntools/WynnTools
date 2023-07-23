const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { blacklistCheck, toFixed, countStatsInDirectory, addNotation } = require('../../helperFunctions.js');
const packageJson = require('../../../package.json');
const config = require('../../../config.json');
const messageId = '1132306220452155423';
const channelId = '1132304234847666320';
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-stats')
    .setDescription('Clear Cache (Dev Only)')
    .setDMPermission(true),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
      if (!interaction.user.id == config.discord.devId) {
        await interaction.reply({ content: 'No Perms?' });
        return;
      }
      const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());
      const channel = await interaction.client.channels.fetch(channelId);
      const message = await channel.messages.fetch(messageId);

      var userData = JSON.parse(fs.readFileSync('data/userData.json'));
      var totalCommandsRun = 0;
      for (const entry in userData) {
        totalCommandsRun += userData[entry].commandsRun;
      }
      const genCommands = [];
      fs.readdirSync(path.resolve(__dirname, '../general')).forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        genCommands.push(file);
      });

      const devCommands = [];
      fs.readdirSync(path.resolve(__dirname, '../dev')).forEach((file) => {
        if (!file.endsWith('.js')) return;
        if (file.toLowerCase().includes('disabled')) return;
        devCommands.push(file);
      });

      const invite = new ButtonBuilder()
        .setLabel('invite')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
        .setStyle(ButtonStyle.Link);

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
            }\`\nServers - \`${await interaction.client.guilds.cache.size}\`\nUptime - <t:${toFixed(
              global.uptime / 1000,
              0
            )}:R>`,
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
          iconURL: 'https://i.imgur.com/uUuZx2E.png',
        });
      await message.edit({ embeds: [embed], components: [row] });
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
