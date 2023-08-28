const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { writeAt, toFixed, generateID } = require('../../functions/helper.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user (Dev Only)')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a user to blacklist')
        .addUserOption((option) => option.setName('target-mention').setDescription('The user'))
        .addStringOption((option) => option.setName('target-id').setDescription('The user'))
        .addStringOption((option) => option.setName('reason').setDescription('The reason for blacklisting'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user to blacklist')
        .addUserOption((option) => option.setName('target-mention').setDescription('The user'))
        .addStringOption((option) => option.setName('target-id').setDescription('The user'))
    ),

  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      let userMention;
      let userId;
      let user;
      var blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
      if (interaction.options.getSubcommand() === 'add') {
        userMention = interaction.options.getMember('target-mention');
        var reason = interaction.options.getString('reason');
        userId = interaction.options.getString('target-id');
        if (reason == null) reason = 'No reason provided';
        if (userMention == null && userId == null) {
          await interaction.reply({ content: 'Please provide a user', ephemeral: true });
          return;
        }
        if (userMention != null) {
          user = userMention;
        } else {
          user = await interaction.guild.members.fetch(userId);
        }
        if (blacklist[user.id]) {
          return await interaction.reply({ content: 'User is already blacklisted', ephemeral: true });
        }
        var blacklistInfo = { id: user.id, reason: reason, timestamp: toFixed(new Date().getTime() / 1000, 0) };
        await writeAt('data/blacklist.json', user.id, blacklistInfo);
        await interaction.reply({ content: 'User has been blacklisted', ephemeral: true });
      } else if (interaction.options.getSubcommand() === 'remove') {
        userMention = interaction.options.getMember('target-mention');
        userId = interaction.options.getString('target-id');
        if (userMention == null && userId == null) {
          return await interaction.reply({ content: 'Please provide a user', ephemeral: true });
        }
        if (userMention != null) {
          user = userMention;
        } else {
          user = await interaction.guild.members.fetch(userId);
        }
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
