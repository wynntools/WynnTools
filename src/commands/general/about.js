const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { blacklistCheck, countStatsInDirectory, addNotation, generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder().setName('about').setDescription('Shows info about the bot').setDMPermission(false),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) throw new Error('You are blacklisted');

      var packageJson = require('../../../package.json');
      const commands = [];
      fs.readdirSync(path.resolve(__dirname, '../general')).forEach((file) => {
        if (!file.endsWith('.js')) return;
        commands.push(file);
      });

      const support = new ButtonBuilder()
        .setLabel('support')
        .setURL(config.discord.supportInvite)
        .setStyle(ButtonStyle.Link);

      const invite = new ButtonBuilder().setLabel('invite').setURL(config.discord.botInvite).setStyle(ButtonStyle.Link);

      const source = new ButtonBuilder()
        .setLabel('source')
        .setURL('https://github.com/Kathund/WynnTools')
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(support, invite, source);

      const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());

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

      var embed = new EmbedBuilder()
        .setTitle(`WynnTools Stats`)
        .setColor(config.discord.embeds.green)
        .setTimestamp()
        .setDescription(
          'WynnTools - A bot that does stuff with the wynncraft api - The Only bot that uses images **that i have seen**'
        )
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
          iconURL: 'https://i.imgur.com/uUuZx2E.png',
        });
      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      var errorId = generateID(10);
      errorMessage(`Error Id - ${errorId}`);
      console.log(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(config.discord.embeds.red)
        .setTitle('An error occurred')
        .setDescription(
          `Use </report-bug:${
            config.discord.commands['report-bug']
          }> to report it\nError id - ${errorId}\nError Info - \`${error.toString().replaceAll('Error: ', '')}\``
        )
        .setFooter({
          text: `by @kathund | ${config.discord.supportInvite} for support`,
          iconURL: 'https://i.imgur.com/uUuZx2E.png',
        });

      const supportDisc = new ButtonBuilder()
        .setLabel('Support Discord')
        .setURL(config.discord.supportInvite)
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(supportDisc);

      await interaction.reply({ embeds: [errorEmbed], rows: [row] });
    }
  },
};
