const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getUsername, getUUID } = require('../../api/mojangAPI.js');
const { generateID } = require('../../helperFunctions.js');
const { register } = require('../../api/pixelicAPI.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDMPermission(false)
    .setDescription('Register a user to the pixelic api')
    .addStringOption((option) =>
      option
        .setName('user')
        .setDescription('The user/uuid of the player you want to be registered to the pixelic api')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
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
      var registerData = await register(uuid);
      console.log(registerData.status);
      if (registerData.status != 201) throw new Error(registerData.error);
      var embed = new EmbedBuilder()
        .setColor(config.discord.embeds.green)
        .setTitle('User Registered')
        .setDescription(`User ${username} has been registered to the pixelic api`)
        .setFooter({
          text: `by @kathund | ${config.discord.supportInvite} for support`,
          iconURL: 'https://i.imgur.com/uUuZx2E.png',
        });

      await interaction.reply({ embeds: [embed] });
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
