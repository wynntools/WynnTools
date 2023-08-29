const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { countStatsInDirectory, addNotation, generateID } = require('../../functions/helper.js');
const packageJson = require('../../../package.json');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-stats')
    .setDescription('Clear Cache (Dev Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    try {
      const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());
      const channel = await interaction.client.channels.fetch(config.discord.channels.stats);
      const message = await channel.messages.fetch(config.discord.messages.stats);
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
            }\`\nServers - \`${await interaction.client.guilds.cache.size}\`\nUptime - <t:${global.uptime}:R>`,
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
        .setFooter({ text: `by @kathund | Stats maybe inaccurate/outdated/cached`, iconURL: config.other.logo });
      await message.edit({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'Updated Stats', ephemeral: true });
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
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
        .setFooter({ text: `by @kathund | ${config.discord.supportInvite} for support`, iconURL: config.other.logo });
      const supportDisc = new ButtonBuilder()
        .setLabel('Support Discord')
        .setURL(config.discord.supportInvite)
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(supportDisc);
      await interaction.reply({ embeds: [errorEmbed], rows: [row] });
    }
  },
};
