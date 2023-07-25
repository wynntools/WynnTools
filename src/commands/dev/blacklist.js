const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { writeAt, blacklistCheck, toFixed, generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user (Dev Only)')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('add a user to blacklist')
        .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for blacklisting'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('remove a user to blacklist')
        .addUserOption((option) => option.setName('target').setDescription('The user').setRequired(true))
    ),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) throw new Error('You are blacklisted');
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }

      var blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
      if (interaction.options.getSubcommand() === 'add') {
        const user = interaction.options.getMember('target');
        var reason = interaction.options.getString('reason');
        if (reason == null) reason = 'No reason provided';
        if (blacklist[user.id]) {
          await interaction.reply({ content: 'User is already blacklisted', ephemeral: true });
          return;
        }
        var blacklistInfo = {
          id: user.id,
          reason: reason,
          timestamp: toFixed(new Date().getTime() / 1000, 0),
        };
        await writeAt('data/blacklist.json', user.id, blacklistInfo);
        await interaction.reply({ content: 'User has been blacklisted', ephemeral: true });
      } else if (interaction.options.getSubcommand() === 'remove') {
        const user = interaction.options.getMember('target');
        if (!blacklist[user.id]) {
          await interaction.reply({ content: 'User is not blacklisted', ephemeral: true });
          return;
        }
        delete blacklist[user.id];
        fs.writeFileSync('data/blacklist.json', JSON.stringify(blacklist));
        await interaction.reply({ content: 'User has been removed from the blacklist', ephemeral: true });
      }
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
