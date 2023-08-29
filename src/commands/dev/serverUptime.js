const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { generateID, writeAt, toFixed } = require('../../functions/helper.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-uptime')
    .setDescription('Server uptime info')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('config')
        .setDescription('Set the config for automatic logging of server uptime')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Set the channel for the server uptime logging to be sent into')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((option) =>
          option.setName('role').setDescription('Assign a role to be pinged server changes state').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('ghost-ping').setDescription('Ghost ping the role').setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName('disable')
            .setDescription('Disable the server uptime logging in your server')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('disable').setDescription('Disable the server uptime logging in your server')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('enable')
        .setDescription('Enable the server uptime logging in your server (If you already have a config)')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('setup-guide').setDescription('server uptime logging Setup Guide')
    ),

  async execute(interaction) {
    try {
      var subcommand = interaction.options.getSubcommand();
      const serverUptimeConfig = JSON.parse(fs.readFileSync('data/serverUptime/config.json'));
      if (subcommand === 'config') {
        var channel = interaction.options.getChannel('channel');
        var role = interaction.options.getRole('role');
        var ghostPing = interaction.options.getBoolean('ghost-ping');
        var disable = interaction.options.getBoolean('disable');
        if (channel == null) channel = interaction.channel;
        if (ghostPing == null) ghostPing = false;
        if (disable == null) disable = false;
        if (serverUptimeConfig[interaction.guild.id]) {
          const embed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setDescription(
              `This guild already has a config set for server uptime logging\nIts currently set to:\n**Channel:**<#${
                serverUptimeConfig[interaction.guildId].channelId
              }>\n**Role:** ${
                serverUptimeConfig[interaction.guildId].roleId != null
                  ? `<@&${serverUptimeConfig[interaction.guildId].roleId}>`
                  : 'None'
              }\n**Ghost Ping:** ${serverUptimeConfig[interaction.guildId].ghostPing}\n**Delete Previous Msgs:** ${
                serverUptimeConfig[interaction.guildId].deleteMsgs
              }\n${
                serverUptimeConfig[interaction.guildId].disabled ? '**Disabled**' : '**Enabled**'
              }\n\n**Do you want to overwrite this config?**`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          const overrideYes = new ButtonBuilder()
            .setCustomId('serverUptimeSetupOverrideYes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Danger);
          const overrideNo = new ButtonBuilder()
            .setCustomId('serverUptimeSetupOverrideNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Success);
          const overrideRow = new ActionRowBuilder().addComponents(overrideYes, overrideNo);
          var overrideConfigMessage = await interaction.reply({ embeds: [embed], components: [overrideRow] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await overrideConfigMessage.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (confirmation.customId == 'serverUptimeSetupOverrideYes') {
              const confirmOverrideYes = new ButtonBuilder()
                .setCustomId('serverUptimeSetupConfirmOverrideYes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Danger);
              const confirmOverrideCancel = new ButtonBuilder()
                .setCustomId('serverUptimeSetupConfirmOverrideCancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);
              const confirmRow = new ActionRowBuilder().addComponents(confirmOverrideYes, confirmOverrideCancel);
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                })
                .setDescription('Are you sure you want to override the data? **THIS CANNOT BE UNDONE!**');
              await confirmation.update({ embeds: [updatedEmbed], components: [confirmRow] });
              const collectorFilter = (i) => i.user.id === interaction.user.id;
              try {
                const confirmOverrideConfirmation = await overrideConfigMessage.awaitMessageComponent({
                  time: config.discord.buttonTimeout * 1000,
                  filter: collectorFilter,
                });
                if (confirmOverrideConfirmation.customId == 'serverUptimeSetupConfirmOverrideYes') {
                  await writeAt('data/serverUptime/config.json', interaction.guild.id, {
                    serverId: interaction.guild.id,
                    channelId: channel.id,
                    roleId: role != null ? role.id : null,
                    ghostPing: ghostPing,
                    disabled: false,
                    setup: { by: interaction.user.id, at: toFixed(new Date().getTime() / 1000, 0) },
                  });
                  const overrideSuccessfully = new EmbedBuilder()
                    .setColor(config.discord.embeds.green)
                    .setDescription(
                      `Data has been updated\n\n**New Data:**\n**Channel:**<#${channel.id}>\n**Role:** ${
                        role != null ? `<@&${role.id}>` : 'None'
                      }\n**Ghost Ping:** ${ghostPing}\n${disable ? '**Disabled**' : '**Enabled**'}`
                    )
                    .setTimestamp()
                    .setFooter({
                      text: `by @kathund | ${config.discord.supportInvite} for support`,
                      iconURL: config.other.logo,
                    });
                  return await confirmOverrideConfirmation.update({ embeds: [overrideSuccessfully], components: [] });
                } else if (confirmOverrideConfirmation.customId == 'serverUptimeSetupConfirmOverrideCancel') {
                  const overrideCancel = new EmbedBuilder()
                    .setColor(config.discord.embeds.red)
                    .setDescription('Data override cancelled')
                    .setTimestamp()
                    .setFooter({
                      text: `by @kathund | ${config.discord.supportInvite} for support`,
                      iconURL: config.other.logo,
                    });
                  return await confirmOverrideConfirmation.update({ embeds: [overrideCancel], components: [] });
                }
              } catch (error) {
                var errorIdOverrideData = generateID(config.other.errorIdLength);
                errorMessage(`Error Id - ${errorIdOverrideData}`);
                console.log(error);
                const overrideCancel = new EmbedBuilder()
                  .setColor(config.discord.embeds.red)
                  .setDescription('Data override cancelled')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await interaction.editReply({ embeds: [overrideCancel], components: [] });
              }
            } else if (confirmation.customId == 'serverUptimeSetupOverrideNo') {
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setDescription('Data override cancelled')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              return await confirmation.update({ embeds: [updatedEmbed], components: [] });
            }
          } catch (error) {
            var errorIdServerUptimeOverride = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdServerUptimeOverride}`);
            console.log(error);
            const updatedEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription('Data override cancelled')
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.editReply({ embeds: [updatedEmbed], components: [] });
          }
        } else {
          const embed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setDescription(
              `**Config has been set**\n\n**Channel:**<#${channel.id}>\n**Role:** ${
                role != null ? `<@&${role.id}>` : 'None'
              }\n**Ghost Ping:** ${ghostPing}\n${disable ? '**Disabled**' : '**Enabled**'}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await writeAt('data/serverUptime/config.json', interaction.guild.id, {
            serverId: interaction.guild.id,
            channelId: channel.id,
            roleId: role != null ? role.id : null,
            ghostPing: ghostPing,
            disabled: false,
            setup: { by: interaction.user.id, at: toFixed(new Date().getTime() / 1000, 0) },
          });
          return await interaction.reply({ embeds: [embed] });
        }
      } else if (subcommand === 'disable') {
        if (serverUptimeConfig[interaction.guild.id]) {
          if (serverUptimeConfig[interaction.guild.id].disabled) {
            const embed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription(
                `Server uptime logging is already disabled in this server\nUse </server-uptime enable:${config.discord.commands['server-uptime']}> to enable them`
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription(
                'Server uptime logging has been disabled. Do you want to delete your config? **THIS CANNOT BE UNDONE!**'
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await writeAt('data/serverUptime/config.json', interaction.guild.id, {
              serverId: serverUptimeConfig[interaction.guild.id].serverId,
              channelId: serverUptimeConfig[interaction.guild.id].channelId,
              roleId: serverUptimeConfig[interaction.guild.id].roleId,
              ghostPing: serverUptimeConfig[interaction.guild.id].ghostPing,
              disabled: true,
              setup: {
                by: serverUptimeConfig[interaction.guild.id].setup.by,
                at: serverUptimeConfig[interaction.guild.id].setup.at,
              },
            });
            const deleteYes = new ButtonBuilder()
              .setCustomId('serverUptimeDeleteConfigYes')
              .setLabel('Yes')
              .setStyle(ButtonStyle.Danger);
            const deleteNo = new ButtonBuilder()
              .setCustomId('serverUptimeDeleteConfigNo')
              .setLabel('No')
              .setStyle(ButtonStyle.Success);
            const deleteRow = new ActionRowBuilder().addComponents(deleteYes, deleteNo);
            var disabledMessage = await interaction.reply({ embeds: [embed], components: [deleteRow] });
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
              const confirmation = await disabledMessage.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (confirmation.customId == 'serverUptimeDeleteConfigYes') {
                delete serverUptimeConfig[interaction.guild.id];
                fs.writeFileSync('data/serverUptime/config.json', JSON.stringify(serverUptimeConfig));
                const updatedEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setDescription('Successfully Deleted this servers config.')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                return await confirmation.update({ embeds: [updatedEmbed], components: [] });
              } else if (confirmation.customId == 'serverUptimeDeleteConfigNo') {
                const updatedEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setDescription('Config not deleted and server uptime logging has disabled.')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                return await confirmation.update({ embeds: [updatedEmbed], components: [] });
              }
            } catch (error) {
              var errorIdDisable = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdDisable}`);
              console.log(error);
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.green)
                .setDescription('server uptime logging has been disabled')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              return await interaction.editReply({ embeds: [updatedEmbed], components: [] });
            }
          }
        } else {
          const failEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setDescription('This server does not have a config set for server uptime logging')
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          return await interaction.reply({ embeds: [failEmbed] });
        }
      } else if (subcommand === 'enable') {
        if (serverUptimeConfig[interaction.guild.id]) {
          if (serverUptimeConfig[interaction.guild.id].disabled) {
            const embed = new EmbedBuilder()
              .setColor(config.discord.embeds.green)
              .setDescription('Server Uptime Logging has been enabled')
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription(
                `Server Uptime Logging is already enabled in this server\nUse </server-uptime disable:${config.discord.commands['server-uptime']}> to disable them`
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await interaction.reply({ embeds: [embed] });
          }
        }
      } else if (subcommand === 'setup-guide') {
        const embed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setTitle('Server Uptime Logging Setup Guide')
          .setDescription(
            `**Step 1:** Create a channel where you want the server uptime logging to be sent into\n**Step 2:** Use </server-uptime config:${config.discord.commands['server-uptime']}> to set the channel\n**Step 3:** (Optional) Create a role to be pinged when the server changes state\n**Step 4:** (Optional) Use </server-uptime config:${config.discord.commands['server-uptime']}> to set the role\n**Step 5:** (Optional) Use </server-uptime config:${config.discord.commands['server-uptime']}> to set the ghost ping\n**Step 6:** (Optional) Use </server-uptime config:${config.discord.commands['server-uptime']}> to set the delete previous messages\n**Step 7:** (Optional) Use </server-uptime config:${config.discord.commands['server-uptime']}> to set the disable\n**Step 8:** Use </server-uptime enable:${config.discord.commands['server-uptime']}> to enable the server uptime logging\n**Step 9:** (Optional) Use </server-uptime disable:${config.discord.commands['server-uptime']}> to disable the server uptime logging`
          )
          .setTimestamp()
          .setFooter({ text: `by @kathund | ${config.discord.supportInvite} for support`, iconURL: config.other.logo });
        return await interaction.reply({ embeds: [embed] });
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
