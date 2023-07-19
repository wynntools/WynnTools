const { writeAt, blacklistCheck } = require('../../helperFunctions.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user (Dev Only)')
    .setDMPermission(true)
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
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | discord.gg/kathund for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
      if (!interaction.user.id == config.discord.devId) {
        await interaction.reply({ content: 'No Perms?', ephemeral: true });
        return;
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
          timestamp: Date.now(),
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
      console.log(error);
      await interaction.reply({ content: `${error}`, ephemeral: true });
    }
  },
};
