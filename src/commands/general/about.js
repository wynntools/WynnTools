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
        .setURL('https://discord.gg/ub63JjGGSN')
        .setStyle(ButtonStyle.Link);

      const invite = new ButtonBuilder()
        .setLabel('invite')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
        .setStyle(ButtonStyle.Link);

      const source = new ButtonBuilder()
        .setLabel('source')
        .setURL('https://github.com/Kathund/WynnTools')
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(support, invite, source);

      const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());

      await interaction.reply({
        embeds: [
          {
            title: 'About',
            description: 'A bot that does stuff with the wynncraft api',
            fields: [
              {
                name: '<:invis:1064700091778220043>',
                value: `<:Dev:1130772126769631272> Developer - \`@kathund\`\n<:commands:1130772895891738706> Commands - \`${commands.length}\`\n<:bullet:1064700156789927936> Version \`${packageJson.version}\`\nServers - \`${interaction.client.guilds.cache.size}\``,
                inline: true,
              },
              {
                name: '<:invis:1064700091778220043>',
                value: `Files - \`${addNotation('oneLetters', totalFiles)}\`\nLines - \`${addNotation(
                  'oneLetters',
                  totalLines
                )}\`\nCharacters - \`${addNotation(
                  'oneLetters',
                  totalCharacters
                )}\`\nCharacters with out spaces - \`${addNotation('oneLetters', totalCharacters - totalWhitespace)}\``,
                inline: true,
              },
            ],
          },
        ],
        components: [row],
      });
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
