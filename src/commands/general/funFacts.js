const {
  SlashCommandBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { generateID, writeAt, toFixed, cleanMessage } = require('../../functions/helper.js');
const { errorMessage } = require('../../functions/logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun-facts')
    .setDescription('Fun Facts')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('config')
        .setDescription('Set the config for the fun facts in your server')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Set the channel for the fun facts to be sent into')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((option) =>
          option.setName('role').setDescription('Assign a role to be pinged when a fun fact is sent').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('ghost-ping').setDescription('Ghost ping the role').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('delete').setDescription('Delete the previous msgs in the channel').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('disable').setDescription('Disable the fun facts in your server').setRequired(false)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('disable').setDescription('Disable the fun facts in your server'))
    .addSubcommand((subcommand) =>
      subcommand.setName('enable').setDescription('Enable the fun facts in your server (If you already have a config)')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('suggest')
        .setDescription('Suggest a fun fact for daily fun facts')
        .addStringOption((option) =>
          option.setName('fact').setDescription('The fun fact you want to suggest').setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('setup-guide').setDescription('Fun Facts Setup Guide')),

  async execute(interaction) {
    try {
      var subcommand;
      if (interaction.options === undefined) {
        subcommand = 'button-setup-guide';
      } else {
        subcommand = interaction.options.getSubcommand();
      }
      const funFactsConfig = JSON.parse(fs.readFileSync('data/funFacts/config.json'));
      const funFactsList = JSON.parse(fs.readFileSync('data/funFacts/list.json'));
      let msg;
      const member = await interaction.guild.members.fetch(interaction.user);
      if (subcommand === 'config') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          throw new Error('You need the manage channels permission to use this command');
        }
        var channel = interaction.options.getChannel('channel');
        var role = interaction.options.getRole('role');
        var ghostPing = interaction.options.getBoolean('ghost-ping');
        var deleteMsgs = interaction.options.getBoolean('delete');
        var disable = interaction.options.getBoolean('disable');
        if (channel == null) channel = interaction.channel;
        if (ghostPing == null) ghostPing = false;
        if (deleteMsgs == null) deleteMsgs = false;
        if (disable == null) disable = false;
        if (funFactsConfig[interaction.guild.id]) {
          const embed = new EmbedBuilder()
            .setColor(config.other.colors.red)
            .setDescription(
              `This guild already has a config set for fun facts\nIts currently set to:\n**Channel:**<#${
                funFactsConfig[interaction.guildId].channelId
              }>\n**Role:** ${
                funFactsConfig[interaction.guildId].roleId != null
                  ? `<@&${funFactsConfig[interaction.guildId].roleId}>`
                  : 'None'
              }\n**Ghost Ping:** ${funFactsConfig[interaction.guildId].ghostPing}\n**Delete Previous Msgs:** ${
                funFactsConfig[interaction.guildId].deleteMsgs
              }\n${
                funFactsConfig[interaction.guildId].disabled ? '**Disabled**' : '**Enabled**'
              }\n\n**Do you want to overwrite this config?**`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund. | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          const overrideYes = new ButtonBuilder()
            .setCustomId('funFactsSetupOverrideYes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Danger);
          const overrideNo = new ButtonBuilder()
            .setCustomId('funFactsSetupOverrideNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Success);
          const overrideRow = new ActionRowBuilder().addComponents(overrideYes, overrideNo);
          msg = await interaction.reply({ embeds: [embed], components: [overrideRow] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (confirmation.customId == 'funFactsSetupOverrideYes') {
              const confirmOverrideYes = new ButtonBuilder()
                .setCustomId('funFactsSetupConfirmOverrideYes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Danger);
              const confirmOverrideCancel = new ButtonBuilder()
                .setCustomId('funFactsSetupConfirmOverrideCancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);
              const confirmRow = new ActionRowBuilder().addComponents(confirmOverrideYes, confirmOverrideCancel);
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.red)
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                })
                .setDescription('Are you sure you want to override the data? **THIS CANNOT BE UNDONE!**');
              await confirmation.update({ embeds: [updatedEmbed], components: [confirmRow] });
              const collectorFilter = (i) => i.user.id === interaction.user.id;
              try {
                const confirmOverrideConfirmation = await msg.awaitMessageComponent({
                  time: config.discord.buttonTimeout * 1000,
                  filter: collectorFilter,
                });
                if (confirmOverrideConfirmation.customId == 'funFactsSetupConfirmOverrideYes') {
                  await writeAt('data/funFacts/config.json', interaction.guild.id, {
                    serverId: interaction.guild.id,
                    channelId: channel.id,
                    roleId: role != null ? role.id : null,
                    ghostPing: ghostPing,
                    deleteMsgs: deleteMsgs,
                    disabled: false,
                    setup: { by: interaction.user.id, at: toFixed(new Date().getTime() / 1000, 0) },
                  });
                  const overrideSuccessfully = new EmbedBuilder()
                    .setColor(config.other.colors.green)
                    .setDescription(
                      `Data has been updated\n\n**New Data:**\n**Channel:**<#${channel.id}>\n**Role:** ${
                        role != null ? `<@&${role.id}>` : 'None'
                      }\n**Ghost Ping:** ${ghostPing}\n**Delete Previous Msgs:** ${deleteMsgs}\n${
                        disable ? '**Disabled**' : '**Enabled**'
                      }`
                    )
                    .setTimestamp()
                    .setFooter({
                      text: `by @kathund. | ${config.discord.supportInvite} for support`,
                      iconURL: config.other.logo,
                    });
                  return await confirmOverrideConfirmation.update({ embeds: [overrideSuccessfully], components: [] });
                } else if (confirmOverrideConfirmation.customId == 'funFactsSetupConfirmOverrideCancel') {
                  const overrideCancel = new EmbedBuilder()
                    .setColor(config.other.colors.red)
                    .setDescription('Data override cancelled')
                    .setTimestamp()
                    .setFooter({
                      text: `by @kathund. | ${config.discord.supportInvite} for support`,
                      iconURL: config.other.logo,
                    });
                  return await confirmOverrideConfirmation.update({ embeds: [overrideCancel], components: [] });
                }
              } catch (error) {
                var errorIdSetup = generateID(config.other.errorIdLength);
                errorMessage(`Error Id - ${errorIdSetup}`);
                errorMessage(error);
                const overrideCancel = new EmbedBuilder()
                  .setColor(config.other.colors.red)
                  .setDescription('Data override cancelled')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund. | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await interaction.editReply({ embeds: [overrideCancel], components: [] });
              }
            } else if (confirmation.customId == 'funFactsSetupOverrideNo') {
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.red)
                .setDescription('Data override cancelled')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              return await confirmation.update({ embeds: [updatedEmbed], components: [] });
            }
          } catch (error) {
            var errorIdSetupOverride = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdSetupOverride}`);
            errorMessage(error);
            const updatedEmbed = new EmbedBuilder()
              .setColor(config.other.colors.red)
              .setDescription('Data override cancelled')
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.editReply({ embeds: [updatedEmbed], components: [] });
          }
        } else {
          const exampleYes = new ButtonBuilder()
            .setCustomId('funFactsSetupYes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success);
          const exampleNo = new ButtonBuilder()
            .setCustomId('funFactsSetupNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger);
          const exampleRow = new ActionRowBuilder().addComponents(exampleYes, exampleNo);
          const embed = new EmbedBuilder()
            .setColor(config.other.colors.green)
            .setDescription(
              `Successfully set the fun facts channel to:\n**Channel:**<#${channel.id}>\n**Role:** ${
                role != null ? `<@&${role.id}>` : 'None'
              }\n**Ghost Ping:** ${ghostPing}\n**Delete Previous Msgs:** ${deleteMsgs}\n${
                disable ? '**Disabled**' : '**Enabled**'
              }\nDo you wanna see an example of a fun fact? (Note that this will be sent to the channel you set and will ping the role you set)`
            )
            .setFooter({
              text: `by @kathund. | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await writeAt('data/funFacts/config.json', interaction.guild.id, {
            serverId: interaction.guild.id,
            channelId: channel.id,
            roleId: role != null ? role.id : null,
            ghostPing: ghostPing,
            deleteMsgs: deleteMsgs,
            disabled: false,
            setup: { by: interaction.user.id, at: toFixed(new Date().getTime() / 1000, 0) },
          });
          msg = await interaction.reply({ embeds: [embed], components: [exampleRow], ephemeral: true });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (confirmation.customId == 'funFactsSetupYes') {
              const exampleEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setTitle('Fun Fact')
                .setDescription('This is an example of a fun fact')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel('Want this in your own discord?')
                  .setURL(config.discord.botInvite)
                  .setStyle(ButtonStyle.Link)
              );
              if (role == null) {
                await channel.send({ embeds: [exampleEmbed], components: [row] });
              } else {
                await channel.send({ content: `<@&${role.id}>`, embeds: [exampleEmbed], components: [row] });
              }
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setDescription(
                  `Successfully sent the example fun fact to <#${channel.id}> ${
                    role != null ? `and pinged <@&${role.id}>` : ''
                  }`
                )
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              await confirmation.update({ embeds: [updatedEmbed], components: [] });
            } else if (confirmation.customId == 'funFactsSetupNo') {
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setDescription(
                  `Successfully set the fun facts channel to <#${channel.id}> ${
                    role != null ? `and set the role to <@&${role.id}>` : ''
                  }`
                )
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              await confirmation.update({ embeds: [updatedEmbed], components: [] });
            }
          } catch (error) {
            var errorIdSetupFirstTime = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdSetupFirstTime}`);
            errorMessage(error);
          }
        }
      } else if (subcommand === 'disable') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          throw new Error('You need the manage channels permission to use this command');
        }
        if (funFactsConfig[interaction.guild.id]) {
          if (!funFactsConfig[interaction.guild.id].disabled) {
            const embed = new EmbedBuilder()
              .setColor(config.other.colors.red)
              .setDescription(
                'Fun Facts have been disabled. Do you want to delete your config? **THIS CANNOT BE UNDONE!**'
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await writeAt('data/funFacts/config.json', interaction.guild.id, {
              serverId: funFactsConfig[interaction.guild.id].serverId,
              channelId: funFactsConfig[interaction.guild.id].channelId,
              roleId: funFactsConfig[interaction.guild.id].roleId,
              ghostPing: funFactsConfig[interaction.guild.id].ghostPing,
              deleteMsgs: funFactsConfig[interaction.guild.id].deleteMsgs,
              disabled: true,
              setup: {
                by: funFactsConfig[interaction.guild.id].setup.by,
                at: funFactsConfig[interaction.guild.id].setup.at,
              },
            });
            const deleteYes = new ButtonBuilder()
              .setCustomId('funFactsDeleteConfigYes')
              .setLabel('Yes')
              .setStyle(ButtonStyle.Danger);
            const deleteNo = new ButtonBuilder()
              .setCustomId('funFactsDeleteConfigNo')
              .setLabel('No')
              .setStyle(ButtonStyle.Success);
            const deleteRow = new ActionRowBuilder().addComponents(deleteYes, deleteNo);
            msg = await interaction.reply({ embeds: [embed], components: [deleteRow] });
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
              const confirmation = await msg.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (confirmation.customId == 'funFactsDeleteConfigYes') {
                delete funFactsConfig[interaction.guild.id];
                fs.writeFileSync('data/funFacts/config.json', JSON.stringify(funFactsConfig));
                const updatedEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green)
                  .setDescription('Successfully Deleted this servers config.')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund. | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                return await confirmation.update({ embeds: [updatedEmbed], components: [] });
              } else if (confirmation.customId == 'funFactsDeleteConfigNo') {
                const updatedEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green)
                  .setDescription('Config not deleted and fun facts disabled.')
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund. | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                return await confirmation.update({ embeds: [updatedEmbed], components: [] });
              }
            } catch (error) {
              var errorIdDisable = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdDisable}`);
              errorMessage(error);
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setDescription('Fun facts have been disabled')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              return await interaction.editReply({ embeds: [updatedEmbed], components: [] });
            }
          } else {
            const embed = new EmbedBuilder()
              .setColor(config.other.colors.red)
              .setDescription(
                `Fun facts are already disabled in this server\nUse </fun-facts enable:${config.discord.commands['fun-facts']}> to enable them`
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await interaction.reply({ embeds: [embed] });
          }
        } else {
          const failEmbed = new EmbedBuilder()
            .setColor(config.other.colors.red)
            .setDescription('This server does not have a config set for fun facts')
            .setTimestamp()
            .setFooter({
              text: `by @kathund. | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          return await interaction.reply({ embeds: [failEmbed] });
        }
      } else if (subcommand === 'enable') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          throw new Error('You need the manage channels permission to use this command');
        }
        if (funFactsConfig[interaction.guild.id]) {
          if (funFactsConfig[interaction.guild.id].disabled) {
            const embed = new EmbedBuilder()
              .setColor(config.other.colors.green)
              .setDescription('Fun Facts have been enabled')
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setColor(config.other.colors.red)
              .setDescription(
                `Fun facts are already enabled in this server\nUse </fun-facts disable:${config.discord.commands['fun-facts']}> to disable them`
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await interaction.reply({ embeds: [embed] });
          }
        }
      } else if (subcommand === 'suggest') {
        var fact = interaction.options.getString('fact');
        if (fact.length >= 1024) {
          const embed = new EmbedBuilder()
            .setColor(config.other.colors.red)
            .setDescription('The fun fact you suggested is too long please keep it under 1024 characters')
            .setTimestamp()
            .setFooter({
              text: `by @kathund. | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          return await interaction.reply({ embeds: [embed] });
        }
        const embed = new EmbedBuilder()
          .setColor(config.other.colors.green)
          .setDescription(
            'Suggestions are not guaranteed to be added to the bot and are not anonymous. Suggestions must follow the rules of the Support discord failure to do so will result in a blacklist from using the bot. These are the important rules and there title - **Rule #1 - Rudeness/Slurs, Rule #2 - Spamming, Rule #3 - No advertising, Rule #5 - English only, Rule #7 - Threats** If you wish to read more please join the support discord with the button below\nDo you wish to continue?'
          )
          .setTimestamp()
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const suggestYes = new ButtonBuilder()
          .setCustomId('funFactsSuggestYes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Success);
        const suggestNo = new ButtonBuilder()
          .setCustomId('funFactsSuggestNo')
          .setLabel('No')
          .setStyle(ButtonStyle.Danger);
        const supportDiscord = new ButtonBuilder()
          .setLabel('Support Discord')
          .setURL(config.discord.supportInvite)
          .setStyle(ButtonStyle.Link);
        const suggestRow = new ActionRowBuilder().addComponents(suggestYes, suggestNo, supportDiscord);
        msg = await interaction.reply({ embeds: [embed], components: [suggestRow] });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          const confirmation = await msg.awaitMessageComponent({
            time: config.discord.buttonTimeout * 1000,
            filter: collectorFilter,
          });
          if (confirmation.customId == 'funFactsSuggestYes') {
            const notifyEmbed = new EmbedBuilder()
              .setColor(config.other.colors.green)
              .setDescription('Do you want to be notified when your fun fact is added?')
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            const notifyYes = new ButtonBuilder()
              .setCustomId('funFactsSuggestNotifyYes')
              .setLabel('Yes')
              .setStyle(ButtonStyle.Success);
            const notifyNo = new ButtonBuilder()
              .setCustomId('funFactsSuggestNotifyNo')
              .setLabel('No')
              .setStyle(ButtonStyle.Danger);
            const notifyRow = new ActionRowBuilder().addComponents(notifyYes, notifyNo);
            await confirmation.update({ embeds: [notifyEmbed], components: [notifyRow] });
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
              const embed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setDescription('Your fun fact has been submitted')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              const channel = await interaction.client.channels.fetch(config.discord.channels['fun-facts-suggestions']);
              let suggestionEmbed;
              const confirmation = await msg.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              var generatedFactId = generateID(10);
              if (confirmation.customId == 'funFactsSuggestNotifyYes') {
                await writeAt('data/funFacts/suggested.json', generatedFactId, {
                  by: interaction.user.id,
                  at: toFixed(new Date().getTime() / 1000, 0),
                  fact: fact,
                  notify: true,
                  id: generatedFactId,
                });
                suggestionEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green)
                  .setTitle(`New Fun Fact Suggestion - ${generatedFactId}`)
                  .setDescription(
                    `**Suggested By:** <@${interaction.user.id}> (${interaction.user.id}\n**Wants to get Notified**\n**Suggestion:** ${fact}`
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund. | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await channel.send({ content: `<@&${config.discord.roles.dev}>`, embeds: [suggestionEmbed] });
                return await confirmation.update({ embeds: [embed], components: [] });
              } else if (confirmation.customId == 'funFactsSuggestNotifyNo') {
                await writeAt('data/funFacts/suggested.json', generatedFactId, {
                  by: interaction.user.id,
                  at: toFixed(new Date().getTime() / 1000, 0),
                  fact: fact,
                  notify: false,
                  id: generatedFactId,
                });
                suggestionEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green)
                  .setTitle(`New Fun Fact Suggestion - ${generatedFactId}`)
                  .setDescription(
                    `**Suggested By:** <@${interaction.user.id}> (${interaction.user.id}\n**Suggestion:** ${fact}`
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund. | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await channel.send({ content: `<@&${config.discord.roles.dev}>`, embeds: [suggestionEmbed] });
                return await confirmation.update({ embeds: [embed], components: [] });
              }
            } catch (error) {
              var errorIdSuggest = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdSuggest}`);
              errorMessage(error);
              const embed = new EmbedBuilder()
                .setColor(config.other.colors.green)
                .setDescription('Fun fact suggestion cancelled')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund. | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              errorMessage(error);
              await interaction.editReply({ embeds: [embed], components: [] });
            }
            await confirmation.update({ embeds: [embed], components: [] });
          } else if (confirmation.customId == 'funFactsSuggestNo') {
            const embed = new EmbedBuilder()
              .setColor(config.other.colors.green)
              .setDescription('Fun fact suggestion cancelled')
              .setTimestamp()
              .setFooter({
                text: `by @kathund. | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await confirmation.update({ embeds: [embed], components: [] });
          }
        } catch (error) {
          var errorIdSuggestNotify = generateID(config.other.errorIdLength);
          errorMessage(`Error ID: ${errorIdSuggestNotify}`);
          errorMessage(error);
          const embed = new EmbedBuilder()
            .setColor(config.other.colors.green)
            .setDescription('Fun fact suggestion cancelled')
            .setTimestamp()
            .setFooter({
              text: `by @kathund. | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.editReply({ embeds: [embed], components: [] });
        }
      } else if (subcommand === 'setup-guide') {
        var guideEmbed = new EmbedBuilder()
          .setColor(config.other.colors.green)
          .setDescription(`To have daily fun facts posted in your discord server its made super easy!\nRead Below`)
          .addFields(
            {
              name: 'Step 1',
              value: `Invite the bot to your server by clicking [here](${config.discord.botInvite}) or click the bot invite button below`,
              inline: false,
            },
            { name: 'Step 2', value: `Create a channel`, inline: false },
            {
              name: 'Step 3',
              value: `Now that you have invited the bot and created a channel there's two things you can do to get the fun facts posted in your server`,
              inline: false,
            },
            {
              name: 'Step 3 Method 1',
              value: `1. Run this command </fun-facts setup-guide:${config.discord.commands['fun-facts']}> in the channel\n3. Click the **__Quick Setup__** button below. This will use the default/Most Common config for the bot`,
              inline: false,
            },
            {
              name: 'Step 3 Method 2 (Advanced Setup)',
              value: `1. Run the config command </fun-facts config:${config.discord.commands['fun-facts']}> and enter the options you want in the command`,
              inline: false,
            }
          )
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const invite = new ButtonBuilder()
          .setLabel('Bot invite')
          .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
          .setStyle(ButtonStyle.Link);
        const quickSetup = new ButtonBuilder()
          .setCustomId('quickSetupFunFacts')
          .setLabel('Quick Setup')
          .setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(invite, quickSetup);
        msg = await interaction.reply({ embeds: [guideEmbed], components: [row], ephemeral: true });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          const confirmation = await msg.awaitMessageComponent({
            time: config.discord.buttonTimeout * 1000,
            filter: collectorFilter,
          });
          if (confirmation.customId == 'quickSetupFunFacts') {
            const updatedEmbed = new EmbedBuilder()
              .setColor(config.other.colors.red)
              .setTimestamp()
              .setDescription(
                `Default config has been saved - The next fun fact will be posted <t:${funFactsList.next}:R>\n\n**Channel:** <#${interaction.channel.id}>\n**Role:** Null\n**nGhost Ping:** ${config.other.emojis.no}\n**Delete Msgs:** ${config.other.emojis.no}`
              );
            await writeAt('data/funFacts/config.json', interaction.guild.id, {
              serverId: interaction.guild.id,
              channelId: interaction.channel.id,
              roleId: null,
              ghostPing: false,
              deleteMsgs: false,
              disabled: false,
            });
            await confirmation.reply({ embeds: [updatedEmbed], components: [] });
          }
        } catch (error) {
          var errorIdQuickSetup = generateID(config.other.errorIdLength);
          errorMessage(`Error Id - ${errorIdQuickSetup}`);
          errorMessage(error);
          await interaction.editReply({ embeds: [guideEmbed], components: [] });
        }
      } else if (subcommand === 'button-setup-guide') {
        var guildButtonEmbed = new EmbedBuilder()
          .setColor(config.other.colors.green)
          .setDescription(`To have daily fun facts posted in your discord server its made super easy!\nRead Below`)
          .addFields(
            {
              name: 'Step 1',
              value: `Invite the bot to your server by clicking [here](${config.discord.botInvite}) or click the bot invite button below`,
              inline: false,
            },
            { name: 'Step 2', value: `Create a channel`, inline: false },
            {
              name: 'Step 3',
              value: `Now that you have invited the bot and created a channel there's two things you can do to get the fun facts posted in your server`,
              inline: false,
            },
            {
              name: 'Step 3 Method 1',
              value: `1. Run this command </fun-facts setup-guide:${config.discord.commands['fun-facts']}> in the channel\n3. Click the **__Quick Setup__** button below. This will use the default/Most Common config for the bot`,
              inline: false,
            },
            {
              name: 'Step 3 Method 2 (Advanced Setup)',
              value: `1. Run the config command </fun-facts config:${config.discord.commands['fun-facts']}> and enter the options you want in the command`,
              inline: false,
            }
          )
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const invite = new ButtonBuilder()
          .setLabel('Bot invite')
          .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(invite);
        await interaction.followUp({ embeds: [guildButtonEmbed], components: [row], ephemeral: true });
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red)
          .setTitle('An error occurred')
          .setDescription(`Error Info - \`${cleanMessage(error)}\``)
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const supportDisc = new ButtonBuilder()
          .setLabel('Support Discord')
          .setURL(config.discord.supportInvite)
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(supportDisc);
        return await interaction.reply({ embeds: [errorEmbed], rows: [row] });
      } else {
        var errorId = generateID(config.other.errorIdLength);
        errorMessage(`Error Id - ${errorId}`);
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red)
          .setTitle('An error occurred')
          .setDescription(
            `Use </report-bug:${
              config.discord.commands['report-bug']
            }> to report it\nError id - ${errorId}\nError Info - \`${cleanMessage(error)}\``
          )
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const supportDisc = new ButtonBuilder()
          .setLabel('Support Discord')
          .setURL(config.discord.supportInvite)
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(supportDisc);
        await interaction.reply({ embeds: [errorEmbed], rows: [row] });
      }
    }
  },
};
