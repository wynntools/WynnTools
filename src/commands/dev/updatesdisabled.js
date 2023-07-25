const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { blacklistCheck, writeAt, generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Set a channel for WynnCraft Updates')
    .setDMPermission(false)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to send updates to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option.setName('role').setDescription('The role to ping when updates are sent').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
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
      const channel = interaction.options.getChannel('channel');
      const role = interaction.options.getRole('role');
      const guildId = interaction.guildId;
      let roleId = null;
      if (role != null) roleId = role.id;
      const channelId = channel.id;
      const updates = JSON.parse(fs.readFileSync('data/updates.json'));
      if (updates[guildId]) {
        const embed = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription(
            `This guild already has a channel set for updates\nIts currently set to <#${updates[guildId].channelId}> ${
              updates[guildId].ping ? `and set to ping <@&${updates[guildId].roleId}>` : ''
            }`
          )
          .setFooter({
            text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });

        const override = new ButtonBuilder()
          .setCustomId('override')
          .setLabel('Override current settings')
          .setStyle(ButtonStyle.Danger);

        const overrideDisabled = new ButtonBuilder()
          .setCustomId('overrideDisabled')
          .setLabel('Override current settings')
          .setDisabled(true)
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(override);
        const rowDisabled = new ActionRowBuilder().addComponents(overrideDisabled);
        var msg = await interaction.reply({
          embeds: [embed],
          components: [row],
        });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          const confirmation = await msg.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
          console.log(confirmation.customId);
          if (confirmation.customId == 'override') {
            const updatedEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.green)
              .setDescription(
                `The channel for updates has been updated\nIts now set to <#${channelId}> ${
                  roleId != null ? `and set to ping <@&${roleId}>` : ''
                }`
              )
              .setFooter({
                text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
                iconURL: 'https://i.imgur.com/uUuZx2E.png',
              });

            await confirmation.update({
              embeds: [updatedEmbed],
              components: [],
            });
          }
        } catch (e) {
          await interaction.editReply({
            embeds: [embed],
            components: [rowDisabled],
          });
        }
      } else {
        var data = {};
        if (roleId == null) {
          data = {
            channelId: channelId,
            ping: false,
          };
        } else {
          data = {
            channelId: channelId,
            roleId: roleId,
            ping: true,
          };
        }
        await writeAt('data/updates.json', guildId, data);
        const embed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setDescription(
            `The channel for updates has been set\nIts set to post into <#${channelId}> ${
              roleId != null ? `and set to ping <@&${roleId}>` : ''
            }`
          )
          .setFooter({
            text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({
          embeds: [embed],
        });
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
