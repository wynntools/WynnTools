const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { register, registerGuild } = require('../../api/pixelicAPI.js');
const { getUsername, getUUID } = require('../../api/mojangAPI.js');
const { generateID } = require('../../functions/helper.js');
const { getGuild } = require('../../api/wynnCraftAPI.js');
const { errorMessage } = require('../../functions/logger.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDMPermission(false)
    .setDescription('Register a someone to the pixelic api')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('player')
        .setDescription('Register a player to the pixelic api')
        .addStringOption((option) =>
          option.setName('username').setDescription('The Username of the person you want to register').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('guild')
        .setDescription('Register a guild to the pixelic api')
        .addStringOption((option) =>
          option.setName('guild').setDescription('The guild you want to register').setRequired(true)
        )
    ),

  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      var subcommand = interaction.options.getSubcommand();
      let registerData;
      let embed;
      if (subcommand === 'player') {
        var user = interaction.options.getString('user');
        let uuid = null;
        let username = null;
        if (user.includes('-')) {
          username = await getUsername(user);
          uuid = user;
        } else {
          username = user;
          uuid = await getUUID(user);
        }
        registerData = await register(uuid);
        console.log(registerData.status);
        if (registerData.status != 201) throw new Error(registerData.error);
        embed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setTitle('User Registered')
          .setDescription(`User ${username} has been registered to the pixelic api`)
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        return await interaction.reply({ embeds: [embed] });
      } else if (subcommand === 'guild') {
        var guildName = interaction.options.getString('guild');
        var guild = await getGuild(guildName);
        embed = new EmbedBuilder()
          .setColor(config.discord.embeds.orange)
          .setTitle('Attempting to register guild')
          .setDescription(`Attempting to register guild ${guild.name} to the pixelic api`)
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [embed] });
        registerData = await registerGuild(guild);
        embed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setTitle('Guild Registered')
          .setDescription(`Successfully registered ${registerData}/${guild.totalMembers} members`)
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        return await interaction.editReply({ embeds: [embed] });
      }
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
