const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { generateID, writeAt } = require('../../helperFunctions.js');
const { getUsername } = require('../../api/discordAPI.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const fs = require('fs');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun-facts-dev')
    .setDescription('Fun Facts but the dev commands (Dev Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Generate a list of all fun facts or all suggestions')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('The type of list you want to generate')
            .setRequired(true)
            .addChoices({ name: 'Facts', value: 'suggested' }, { name: 'List', value: 'list' })
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('send').setDescription('force send fun facts')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View a fun fact')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('The type of fun fact')
            .setRequired(true)
            .addChoices({ name: 'Facts', value: 'suggested' }, { name: 'List', value: 'list' })
        )
        .addStringOption((option) =>
          option.setName('id').setDescription('The ID of the fun fact').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('approve')
        .setDescription('Approve a fun fact')
        .addStringOption((option) =>
          option.setName('id').setDescription('The ID of the fun fact').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('deny')
        .setDescription('Deny a fun fact')
        .addStringOption((option) =>
          option.setName('id').setDescription('The ID of the fun fact').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete a fun fact')
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('The type of fun fact')
            .setRequired(true)
            .addChoices({ name: 'Facts', value: 'suggested' }, { name: 'List', value: 'list' })
        )
        .addStringOption((option) =>
          option.setName('id').setDescription('The ID of the fun fact').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('configs')
        .setDescription('View the configs for fun facts')
        .addStringOption((option) =>
          option
            .setName('server-id')
            .setDescription('The ID of the server you want to view the configs for')
            .setRequired(false)
        )
    ),
  async execute(interaction) {
    var startTime = Math.floor(Date.now() / 1000);
    const blacklist = new Set();
    function checkFunFact(fact) {
      try {
        if (fact.lastSent + 1209600 < startTime) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    const funFactList = JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'));
    function getRandomFact() {
      try {
        const validFacts = funFactList.facts.filter((fact) => !blacklist.has(fact.id));
        if (validFacts.length === 0) {
          console.log('No more valid fun facts available.');
          return null;
        }
        const randomFact = validFacts[Math.floor(Math.random() * validFacts.length)];
        return randomFact;
      } catch (error) {
        console.log(error);
        return null;
      }
    }
    try {
      if (
        !(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(
          config.discord.roles.dev
        )
      ) {
        throw new Error('No Perms');
      }
      var subcommand = interaction.options.getSubcommand();
      const suggestedData = JSON.parse(fs.readFileSync('data/funFacts/suggested.json'));
      const listData = JSON.parse(fs.readFileSync('data/funFacts/list.json'));
      const factList = listData.facts;
      let i = 0;
      let list = '';
      let msg;
      if (subcommand === 'list') {
        var type = interaction.options.getString('type');
        if (type === 'list') {
          for (let i = 0; i < factList.length; i++) {
            const fact = factList[i];
            list += `**${i + 1}**`;
            if (fact.lastSent > 0) {
              list += ` - Last Sent: <t:${fact.lastSent}:R>\n`;
            } else {
              list += '\n';
            }
          }
          const listEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle('Fun Facts List')
            .setDescription(list)
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          return await interaction.reply({ embeds: [listEmbed] });
        } else if (type === 'suggested') {
          const objects = Object.keys(suggestedData);
          if (objects.length == 0) throw new Error('No suggestions');
          for (i = 0; i < objects.length; i++) {
            list += `**${i + 1}** -  ID: ${objects[i]}\n`;
          }
          const listEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle('Fun Facts List')
            .setDescription(list)
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          return await interaction.reply({ embeds: [listEmbed] });
        }
      } else if (subcommand === 'send') {
        const confirmEmbed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setTitle('Are you sure?')
          .setDescription('This will send fun-facts to every setup server')
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const confirmButton = new ButtonBuilder()
          .setLabel('Confirm')
          .setCustomId('funFactsDevSendConfirm')
          .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
          .setLabel('Cancel')
          .setCustomId('funFactsDevSendCancel')
          .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
        msg = await interaction.reply({ embeds: [confirmEmbed], components: [row] });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          const confirmation = await msg.awaitMessageComponent({
            time: config.discord.buttonTimeout * 1000,
            filter: collectorFilter,
          });
          if (confirmation.customId == 'funFactsDevSendConfirm') {
            try {
              let funFact;
              let numCheckedFacts = 0;
              const totalFacts = Object.keys(
                JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'))
              ).length;
              do {
                funFact = getRandomFact();
                if (funFact && checkFunFact(funFact)) {
                  /* empty */
                } else if (funFact) {
                  blacklist.add(funFact.id);
                }
                numCheckedFacts++;
              } while (funFact && !checkFunFact(funFact) && numCheckedFacts < totalFacts);
              if (!funFact || (funFact && !checkFunFact(funFact))) {
                console.log('No valid fun facts found.');
              }
              const funFactConfigs = JSON.parse(
                fs.readFileSync('data/funFacts/config.json', 'utf8')
              );
              const funFactConfigsObject = Object.keys(funFactConfigs);
              const setup = new ButtonBuilder()
                .setCustomId('setupGuideFunFacts')
                .setLabel('How to setup')
                .setStyle(ButtonStyle.Primary);
              const row = new ActionRowBuilder().addComponents(setup);
              var requestedByString = '';
              if (funFact.requestedBy && funFact.hidden != false) {
                requestedByString = `Requested by ${await getUsername(funFact.requestedBy)} | `;
              }
              const funFactEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.green)
                .setDescription(
                  `**Today's Fun fact is** \n${
                    funFact.fact
                  }\n\n${requestedByString}Next fun fact <t:${startTime + 86400}:R>`
                )
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              let currentConfig;
              for (let i = 0; i < funFactConfigsObject.length; i++) {
                currentConfig = funFactConfigs[funFactConfigsObject[i]];
                if (currentConfig.disabled) return;
                const serverId = currentConfig.serverId;
                const channelId = currentConfig.channelId;
                const guild = interaction.client.guilds.cache.get(serverId);
                const channel = guild.channels.cache.get(channelId);
                var role = currentConfig.roleId;
                if (role === serverId) {
                  role = '@everyone';
                } else if (role === null) {
                  role = '';
                } else {
                  role = `<@&${role}>`;
                }
                if (currentConfig.deleteMsgs) await channel.bulkDelete(100);
                if (currentConfig.role === null) {
                  await channel.send({ embeds: [funFactEmbed], components: [row] });
                } else {
                  if (currentConfig.ghostPing) {
                    await channel.sent({ content: role });
                    await channel.bulkDelete(1);
                    await delay(300);
                    await channel.send({ embeds: [funFactEmbed], components: [row] });
                  } else {
                    await channel.send({
                      embeds: [funFactEmbed],
                      components: [row],
                      content: role,
                    });
                  }
                }
                await delay(300);
              }
              await writeAt(
                'data/funFacts/list.json',
                'facts',
                funFactList.facts.map((fact) =>
                  fact.id === funFact.id ? { ...fact, lastSent: startTime } : fact
                )
              );
              await writeAt('data/funFacts/list.json', 'next', startTime + 86400);
            } catch (error) {
              console.error(error);
            }
            const updatedEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.green)
              .setDescription('Sent all Fun Facts')
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await confirmation.update({ embeds: [updatedEmbed], components: [] });
          } else if (confirmation.customId == 'funFactsDevSendCancel') {
            const cancelEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription('Cancelled sending Fun Facts')
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await confirmation.update({ embeds: [cancelEmbed], components: [] });
          }
        } catch (error) {
          const cancelEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setDescription('Cancelled sending Fun Facts')
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.editReply({ embeds: [cancelEmbed], components: [] });
        }
      } else if (subcommand === 'view') {
        var facType = interaction.options.getString('type');
        var facId = interaction.options.getString('id');
        let fact;
        if (facType === 'list') {
          fact = listData[facId];
          if (!fact) throw new Error('Invalid ID');
          let requestedByString = '';
          if (fact.requestedBy && fact.hidden == false) {
            requestedByString = `Requested by ${await getUsername(fact.requestedBy)}`;
          }
          if (fact.lastSent > 0) {
            requestedByString = `${requestedByString} | Last sent <t:${fact.lastSent}:R>`;
          } else {
            requestedByString = `${requestedByString} | Never been sent`;
          }
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle(`Fun Fact #${fact.id}`)
            .setDescription(`${fact.fact}\n\n${requestedByString}`)
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        } else if (facType === 'suggested') {
          fact = suggestedData[facId];
          if (!fact) throw new Error('Invalid ID');
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle(`Fun Fact #${fact.id}`)
            .setDescription(
              `${fact.fact}\n\nRequested by ${await getUsername(fact.by)} | Requested at <t:${
                fact.at
              }:R>`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        }
      } else if (subcommand === 'approve') {
        const id = interaction.options.getString('id');
        const fact = suggestedData[id];
        if (!fact) throw new Error('Invalid ID');
        if (suggestedData[id].notify) {
          const notifyEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle('Fun Fact Approved')
            .setDescription(
              `Your Fun Fact has been approved and added to the list of Fun Facts\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.client.users.send(suggestedData[id].by, { embeds: [notifyEmbed] });
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle('Fun Fact Approved')
            .setDescription(
              `The Fun Fact has been approved and added to the list of Fun Facts. The user has been successfully notified\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        } else {
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle('Fun Fact Approved')
            .setDescription(
              `The Fun Fact has been approved and added to the list of Fun Facts.\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        }
        await writeAt('data/funFacts/list.json', id, {
          requestedBy: fact.by,
          fact: fact.fact,
          id: id,
          lastSent: 0,
        });
        delete suggestedData[id];
        fs.writeFileSync('data/funFacts/suggested.json', JSON.stringify(suggestedData));
      } else if (subcommand === 'deny') {
        const id = interaction.options.getString('id');
        const fact = suggestedData[id];
        if (!fact) throw new Error('Invalid ID');
        if (suggestedData[id].notify) {
          const notifyEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setTitle('Fun Fact Denied')
            .setDescription(
              `Your Fun Fact has been denied and not added to the list of Fun Facts\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.client.users.send(suggestedData[id].by, { embeds: [notifyEmbed] });
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setTitle('Fun Fact Denied')
            .setDescription(
              `The Fun Fact has been denied and not added to the list of Fun Facts. The user has been successfully notified\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        } else {
          const factEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.red)
            .setTitle('Fun Fact Denied')
            .setDescription(
              `The Fun Fact has been denied and not added to the list of Fun Facts.\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
          await interaction.reply({ embeds: [factEmbed] });
        }
        delete suggestedData[id];
        fs.writeFileSync('data/funFacts/suggested.json', JSON.stringify(suggestedData));
      } else if (subcommand === 'delete') {
        var id = interaction.options.getString('id');
        var fact = listData[id];
        if (!fact) throw new Error('Invalid ID');
        const factEmbed = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setTitle('Are you sure?')
          .setDescription(
            `Are you sure you want to delete the Fun Fact?\n\n**Fun Fact Id:** ${id}\n**Fun Fact:** ${fact.fact}`
          )
          .setTimestamp()
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const confirmButton = new ButtonBuilder()
          .setLabel('Confirm')
          .setStyle(ButtonStyle.Danger)
          .setCustomId('confirm');
        const cancelButton = new ButtonBuilder()
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
          .setCustomId('cancel');
        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
        msg = await interaction.reply({ embeds: [factEmbed], components: [row] });
      } else if (subcommand === 'configs') {
        var serverId = interaction.options.getString('server-id');
        let configs = JSON.parse(fs.readFileSync('data/funFacts/config.json', 'utf8'));
        let configsObject = Object.keys(configs);
        let currentConfig;
        if (serverId === null) {
          var num = 0;
          currentConfig = configs[configsObject[num]];
          const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
          const channel = guild.channels.cache.get(currentConfig.channelId);
          let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
          if (currentConfig.roleId) {
            const role = guild.roles.cache.get(currentConfig.roleId);
            if (role.id === guild.id) {
              string += `\n**Role:** @everyone | @everyone (${role.id})`;
            } else {
              string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
            }
          } else {
            string += `\n**Role:** None`;
          }
          string += `\n**Ghost Ping:** ${
            currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          string += `\n**Delete Messages:** ${
            currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          string += `\n**Disabled:** ${
            currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          const configEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle(
              `Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${configsObject.length}`
            )
            .setDescription(string);
          const leftButton = new ButtonBuilder()
            .setEmoji('1135038841426825297')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('leftButtonConfigs');

          const editButton = new ButtonBuilder()
            .setEmoji('📝')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('editButtonConfig');

          const rightButton = new ButtonBuilder()
            .setEmoji('1135038844706762799')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('rightButtonConfigs');

          const reloadButtonConfigs = new ButtonBuilder()
            .setEmoji('🔄️')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('reloadButtonConfigs');

          const row = new ActionRowBuilder().addComponents(
            leftButton,
            editButton,
            rightButton,
            reloadButtonConfigs
          );

          msg = await interaction.reply({ embeds: [configEmbed], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            let confirmation;
            while (true) {
              confirmation = await msg.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (confirmation.customId === 'leftButtonConfigs') {
                num = num - 1;
                if (num <= 0) num = configsObject.length - 1;
                currentConfig = configs[configsObject[num]];
                const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
                const channel = guild.channels.cache.get(currentConfig.channelId);
                let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                if (currentConfig.roleId) {
                  const role = guild.roles.cache.get(currentConfig.roleId);
                  if (role.id === guild.id) {
                    string += `\n**Role:** @everyone | @everyone (${role.id})`;
                  } else {
                    string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                  }
                } else {
                  string += `\n**Role:** None`;
                }
                string += `\n**Ghost Ping:** ${
                  currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Delete Messages:** ${
                  currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Disabled:** ${
                  currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                const configEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setTitle(
                    `Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${
                      configsObject.length
                    }`
                  )
                  .setDescription(string);
                await confirmation.update({ embeds: [configEmbed], components: [row] });
              } else if (confirmation.customId === 'editButtonConfig') {
                currentConfig = configs[configsObject[num]];
                const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
                const channel = guild.channels.cache.get(currentConfig.channelId);
                let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                if (currentConfig.roleId) {
                  const role = guild.roles.cache.get(currentConfig.roleId);
                  if (role.id === guild.id) {
                    string += `\n**Role:** @everyone | @everyone (${role.id})`;
                  } else {
                    string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                  }
                } else {
                  string += `\n**Role:** None`;
                }
                string += `\n**Ghost Ping:** ${
                  currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Delete Messages:** ${
                  currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Disabled:** ${
                  currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                }`;

                const deleteConfigButton = new ButtonBuilder()
                  .setCustomId('deleteConfigButton')
                  .setLabel('Delete Config')
                  .setStyle(ButtonStyle.Danger);

                const ghostPingButton = new ButtonBuilder()
                  .setCustomId('ghostPingButton')
                  .setLabel(currentConfig.ghostPing ? 'Disable Ghost Ping' : 'Enable Ghost Ping')
                  .setStyle(currentConfig.disabled ? ButtonStyle.Danger : ButtonStyle.Success);

                const deleteMessagesButton = new ButtonBuilder()
                  .setCustomId('deleteMessagesButton')
                  .setLabel(
                    currentConfig.deleteMsgs ? 'Disable Delete Messages' : 'Enable Delete Messages'
                  )
                  .setStyle(currentConfig.disabled ? ButtonStyle.Danger : ButtonStyle.Success);

                const disableEnableButton = new ButtonBuilder()
                  .setCustomId('disableEnableButton')
                  .setLabel(currentConfig.disabled ? 'Enable' : 'Disable')
                  .setStyle(currentConfig.disabled ? ButtonStyle.Success : ButtonStyle.Danger);

                const saveConfigButton = new ButtonBuilder()
                  .setCustomId('saveConfigButton')
                  .setLabel('Save Config')
                  .setStyle(ButtonStyle.Success);

                const editRow = new ActionRowBuilder().addComponents(
                  deleteConfigButton,
                  ghostPingButton,
                  deleteMessagesButton,
                  disableEnableButton,
                  saveConfigButton
                );

                const editEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setTitle(`Edit Mode Enabled`)
                  .setDescription(string);

                var editMessage = await interaction.reply({
                  components: [editRow],
                  embeds: [editEmbed],
                  ephemeral: true,
                });
                const collectorFilter = (i) => i.user.id === interaction.user.id;
                try {
                  while (true) {
                    var editMessageConfirmation = await editMessage.awaitMessageComponent({
                      time: config.discord.buttonTimeout * 1000,
                      filter: collectorFilter,
                    });
                    if (editMessageConfirmation.customId === 'deleteConfigButton') {
                      delete configs[configsObject[num]];
                      fs.writeFileSync('data/funFacts/config.json', JSON.stringify(configs));

                      var configDeletedEmbed = new EmbedBuilder()
                        .setColor(config.discord.embeds.red)
                        .setTitle('Config Deleted')
                        .setDescription(
                          `The config for ${guild.name} (${guild.id}) has been deleted`
                        )
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });

                      await editMessage.update({ embeds: [configDeletedEmbed], components: [] });
                    } else if (editMessageConfirmation.customId === 'ghostPingButton') {
                      currentConfig.ghostPing = !currentConfig.ghostPing;
                      let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                      if (currentConfig.roleId) {
                        if (role.id === guild.id) {
                          string += `\n**Role:** @everyone | @everyone (${role.id})`;
                        } else {
                          string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                        }
                      } else {
                        string += `\n**Role:** None`;
                      }
                      string += `\n**Ghost Ping:** ${
                        currentConfig.ghostPing
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Delete Messages:** ${
                        currentConfig.deleteMsgs
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;

                      var ghostPingUpdateEmbed = new EmbedBuilder()
                        .setColor(config.discord.embeds.green)
                        .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                        .setDescription(string)
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });

                      await editMessageConfirmation.update({
                        embeds: [ghostPingUpdateEmbed],
                        components: [editRow],
                      });
                    } else if (editMessageConfirmation.customId === 'deleteMessagesButton') {
                      currentConfig.deleteMsgs = !currentConfig.deleteMsgs;
                      let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                      if (currentConfig.roleId) {
                        if (role.id === guild.id) {
                          string += `\n**Role:** @everyone | @everyone (${role.id})`;
                        } else {
                          string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                        }
                      } else {
                        string += `\n**Role:** None`;
                      }
                      string += `\n**Ghost Ping:** ${
                        currentConfig.ghostPing
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Delete Messages:** ${
                        currentConfig.deleteMsgs
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;

                      var updatedDeleteMessageEmbed = new EmbedBuilder()
                        .setColor(config.discord.embeds.green)
                        .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                        .setDescription(string)
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });

                      await editMessageConfirmation.update({
                        embeds: [updatedDeleteMessageEmbed],
                        components: [editRow],
                      });
                    } else if (editMessageConfirmation.customId === 'disableEnableButton') {
                      currentConfig.disabled = !currentConfig.disabled;
                      let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                      if (currentConfig.roleId) {
                        if (role.id === guild.id) {
                          string += `\n**Role:** @everyone | @everyone (${role.id})`;
                        } else {
                          string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                        }
                      } else {
                        string += `\n**Role:** None`;
                      }
                      string += `\n**Ghost Ping:** ${
                        currentConfig.ghostPing
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Delete Messages:** ${
                        currentConfig.deleteMsgs
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled
                          ? config.discord.emojis.yes
                          : config.discord.emojis.no
                      }`;

                      var disableEnableUpdateEmbed = new EmbedBuilder()
                        .setColor(config.discord.embeds.green)
                        .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                        .setDescription(string)
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });

                      await editMessageConfirmation.update({
                        embeds: [disableEnableUpdateEmbed],
                        components: [editRow],
                      });
                    } else if (editMessageConfirmation === 'saveConfigButton') {
                      await writeAt('data/funFacts/config.json', currentConfig.serverId, {
                        serverId: currentConfig.serverId,
                        channelId: currentConfig.channelId,
                        roleId: currentConfig.roleId,
                        ghostPing: currentConfig.ghostPing,
                        deleteMsgs: currentConfig.deleteMsgs,
                        disabled: currentConfig.disabled,
                        setup: { by: currentConfig.setup.by, at: currentConfig.setup.at },
                      });

                      const savedConfigEmbed = new EmbedBuilder()
                        .setColor(config.discord.embeds.green)
                        .setTitle(`Config has been saved for ${guild.name} (${guild.id})`)
                        .setDescription(
                          'Please click the refresh button to reload the configs that are displayed above'
                        )
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });

                      await editMessageConfirmation.update({ embed: [savedConfigEmbed] });
                    }
                  }
                } catch (error) {
                  console.log(error);
                }
              } else if (confirmation.customId === 'rightButtonConfigs') {
                num = num + 1;
                if (num >= configsObject.length) num = 0;
                currentConfig = configs[configsObject[num]];
                const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
                const channel = guild.channels.cache.get(currentConfig.channelId);
                let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                if (currentConfig.roleId) {
                  const role = guild.roles.cache.get(currentConfig.roleId);
                  if (role.id === guild.id) {
                    string += `\n**Role:** @everyone | @everyone (${role.id})`;
                  } else {
                    string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                  }
                } else {
                  string += `\n**Role:** None`;
                }
                string += `\n**Ghost Ping:** ${
                  currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Delete Messages:** ${
                  currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Disabled:** ${
                  currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                const configEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setTitle(
                    `Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${
                      configsObject.length
                    }`
                  )
                  .setDescription(string);
                await confirmation.update({ embeds: [configEmbed], components: [row] });
              } else if (confirmation.customId === 'reloadButtonConfigs') {
                configs = JSON.parse(fs.readFileSync('data/funFacts/config.json', 'utf8'));
                configsObject = Object.keys(configs);

                currentConfig = configs[configsObject[num]];
                const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
                const channel = guild.channels.cache.get(currentConfig.channelId);
                let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                if (currentConfig.roleId) {
                  const role = guild.roles.cache.get(currentConfig.roleId);
                  if (role.id === guild.id) {
                    string += `\n**Role:** @everyone | @everyone (${role.id})`;
                  } else {
                    string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                  }
                } else {
                  string += `\n**Role:** None`;
                }
                string += `\n**Ghost Ping:** ${
                  currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Delete Messages:** ${
                  currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                string += `\n**Disabled:** ${
                  currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                }`;
                const configEmbed = new EmbedBuilder()
                  .setColor(config.discord.embeds.green)
                  .setTitle(
                    `Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${
                      configsObject.length
                    }`
                  )
                  .setDescription(string);
                await confirmation.update({ embeds: [configEmbed], components: [row] });
              }
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          currentConfig = configs[serverId];
          if (!currentConfig) throw new Error('Invalid ID');
          const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
          const channel = guild.channels.cache.get(currentConfig.channelId);
          let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
          if (currentConfig.roleId) {
            const role = guild.roles.cache.get(currentConfig.roleId);
            if (role.id === guild.id) {
              string += `\n**Role:** @everyone | @everyone (${role.id})`;
            } else {
              string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
            }
          } else {
            string += `\n**Role:** None`;
          }
          string += `\n**Ghost Ping:** ${
            currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          string += `\n**Delete Messages:** ${
            currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          string += `\n**Disabled:** ${
            currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
          }`;
          const configEmbed = new EmbedBuilder()
            .setColor(config.discord.embeds.green)
            .setTitle(`Fun Fact Configs - ${currentConfig.serverId}`)
            .setDescription(string);

          const editButton = new ButtonBuilder()
            .setEmoji('📝')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('editButtonConfig');

          const reloadButtonConfigs = new ButtonBuilder()
            .setEmoji('🔄️')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('reloadButtonConfigs');
          const row = new ActionRowBuilder().addComponents(editButton, reloadButtonConfigs);
          var inputIdMessage = await interaction.reply({
            embeds: [configEmbed],
            components: [row],
          });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            var inputIdConfirm = await inputIdMessage.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (inputIdConfirm.customId === 'editButtonConfig') {
              // ! aa
              let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
              if (currentConfig.roleId) {
                const role = guild.roles.cache.get(currentConfig.roleId);
                if (role.id === guild.id) {
                  string += `\n**Role:** @everyone | @everyone (${role.id})`;
                } else {
                  string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                }
              } else {
                string += `\n**Role:** None`;
              }
              string += `\n**Ghost Ping:** ${
                currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
              }`;
              string += `\n**Delete Messages:** ${
                currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
              }`;
              string += `\n**Disabled:** ${
                currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
              }`;

              const deleteConfigInputIdButton = new ButtonBuilder()
                .setCustomId('deleteConfigInputIdButton')
                .setLabel('Delete Config')
                .setStyle(ButtonStyle.Danger);

              const ghostPingInputIdButton = new ButtonBuilder()
                .setCustomId('ghostPingInputIdButton')
                .setLabel(currentConfig.ghostPing ? 'Disable Ghost Ping' : 'Enable Ghost Ping')
                .setStyle(currentConfig.disabled ? ButtonStyle.Danger : ButtonStyle.Success);

              const deleteMessagesInputIdButton = new ButtonBuilder()
                .setCustomId('deleteMessagesInputIdButton')
                .setLabel(
                  currentConfig.deleteMsgs ? 'Disable Delete Messages' : 'Enable Delete Messages'
                )
                .setStyle(currentConfig.disabled ? ButtonStyle.Danger : ButtonStyle.Success);

              const disableEnableInputIdButton = new ButtonBuilder()
                .setCustomId('disableEnableInputIdButton')
                .setLabel(currentConfig.disabled ? 'Enable' : 'Disable')
                .setStyle(currentConfig.disabled ? ButtonStyle.Success : ButtonStyle.Danger);

              const saveConfigInputIdButton = new ButtonBuilder()
                .setCustomId('saveConfigInputIdButton')
                .setLabel('Save Config')
                .setStyle(ButtonStyle.Success);

              const editInputIdRow = new ActionRowBuilder().addComponents(
                deleteConfigInputIdButton,
                ghostPingInputIdButton,
                deleteMessagesInputIdButton,
                disableEnableInputIdButton,
                saveConfigInputIdButton
              );

              const editMessageInputIdEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.green)
                .setTitle(`Edit Mode Enabled`)
                .setDescription(string);

              var editInputIdMessage = await interaction.reply({
                embeds: [editMessageInputIdEmbed],
                components: [editInputIdRow],
                ephemeral: true,
              });
              const collectorFilter = (i) => i.user.id === interaction.user.id;
              try {
                while (true) {
                  var editMessageInputIdConfirmation =
                    await editInputIdMessage.awaitMessageComponent({
                      time: config.discord.buttonTimeout * 1000,
                      filter: collectorFilter,
                    });
                  if (editMessageInputIdConfirmation.customId === 'deleteConfigInputIdButton') {
                    delete configs[configsObject[num]];
                    fs.writeFileSync('data/funFacts/config.json', JSON.stringify(configs));

                    var configDeletedInputIdEmbed = new EmbedBuilder()
                      .setColor(config.discord.embeds.red)
                      .setTitle('Config Deleted')
                      .setDescription(`The config for ${guild.name} (${guild.id}) has been deleted`)
                      .setTimestamp()
                      .setFooter({
                        text: `by @kathund | ${config.discord.supportInvite} for support`,
                        iconURL: config.other.logo,
                      });

                    await editMessageInputIdConfirmation.update({
                      embeds: [configDeletedInputIdEmbed],
                      components: [],
                    });
                  } else if (editMessageInputIdConfirmation.customId === 'ghostPingInputIdButton') {
                    currentConfig.ghostPing = !currentConfig.ghostPing;
                    let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                    if (currentConfig.roleId) {
                      if (role.id === guild.id) {
                        string += `\n**Role:** @everyone | @everyone (${role.id})`;
                      } else {
                        string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                      }
                    } else {
                      string += `\n**Role:** None`;
                    }
                    string += `\n**Ghost Ping:** ${
                      currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;
                    string += `\n**Delete Messages:** ${
                      currentConfig.deleteMsgs
                        ? config.discord.emojis.yes
                        : config.discord.emojis.no
                    }`;
                    string += `\n**Disabled:** ${
                      currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;

                    var ghostPingUpdateInputIdEmbed = new EmbedBuilder()
                      .setColor(config.discord.embeds.green)
                      .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                      .setDescription(string)
                      .setTimestamp()
                      .setFooter({
                        text: `by @kathund | ${config.discord.supportInvite} for support`,
                        iconURL: config.other.logo,
                      });

                    await editMessageInputIdConfirmation.update({
                      embeds: [ghostPingUpdateInputIdEmbed],
                      components: [editInputIdRow],
                    });
                  } else if (
                    editMessageInputIdConfirmation.customId === 'deleteMessagesInputIdButton'
                  ) {
                    currentConfig.deleteMsgs = !currentConfig.deleteMsgs;
                    let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                    if (currentConfig.roleId) {
                      if (role.id === guild.id) {
                        string += `\n**Role:** @everyone | @everyone (${role.id})`;
                      } else {
                        string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                      }
                    } else {
                      string += `\n**Role:** None`;
                    }
                    string += `\n**Ghost Ping:** ${
                      currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;
                    string += `\n**Delete Messages:** ${
                      currentConfig.deleteMsgs
                        ? config.discord.emojis.yes
                        : config.discord.emojis.no
                    }`;
                    string += `\n**Disabled:** ${
                      currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;

                    var updatedDeleteMessageInputIdEmbed = new EmbedBuilder()
                      .setColor(config.discord.embeds.green)
                      .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                      .setDescription(string)
                      .setTimestamp()
                      .setFooter({
                        text: `by @kathund | ${config.discord.supportInvite} for support`,
                        iconURL: config.other.logo,
                      });

                    await editMessageInputIdConfirmation.update({
                      embeds: [updatedDeleteMessageInputIdEmbed],
                      components: [editInputIdRow],
                    });
                  } else if (
                    editMessageInputIdConfirmation.customId === 'disableEnableInputIdButton'
                  ) {
                    currentConfig.disabled = !currentConfig.disabled;
                    let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
                    if (currentConfig.roleId) {
                      if (role.id === guild.id) {
                        string += `\n**Role:** @everyone | @everyone (${role.id})`;
                      } else {
                        string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
                      }
                    } else {
                      string += `\n**Role:** None`;
                    }
                    string += `\n**Ghost Ping:** ${
                      currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;
                    string += `\n**Delete Messages:** ${
                      currentConfig.deleteMsgs
                        ? config.discord.emojis.yes
                        : config.discord.emojis.no
                    }`;
                    string += `\n**Disabled:** ${
                      currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                    }`;

                    var disableEnableUpdateInputIdEmbed = new EmbedBuilder()
                      .setColor(config.discord.embeds.green)
                      .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                      .setDescription(string)
                      .setTimestamp()
                      .setFooter({
                        text: `by @kathund | ${config.discord.supportInvite} for support`,
                        iconURL: config.other.logo,
                      });

                    await editMessageInputIdConfirmation.update({
                      embeds: [disableEnableUpdateInputIdEmbed],
                      components: [editInputIdRow],
                    });
                  } else if (
                    editMessageInputIdConfirmation.customId === 'saveConfigInputIdButton'
                  ) {
                    await writeAt('data/funFacts/config.json', currentConfig.serverId, {
                      serverId: currentConfig.serverId,
                      channelId: currentConfig.channelId,
                      roleId: currentConfig.roleId,
                      ghostPing: currentConfig.ghostPing,
                      deleteMsgs: currentConfig.deleteMsgs,
                      disabled: currentConfig.disabled,
                      setup: { by: currentConfig.setup.by, at: currentConfig.setup.at },
                    });

                    const savedConfigInputIdEmbed = new EmbedBuilder()
                      .setColor(config.discord.embeds.green)
                      .setTitle(`Config has been saved for ${guild.name} (${guild.id})`)
                      .setDescription(
                        'Please click the refresh button to reload the config that is displayed above'
                      )
                      .setTimestamp()
                      .setFooter({
                        text: `by @kathund | ${config.discord.supportInvite} for support`,
                        iconURL: config.other.logo,
                      });

                    await editMessageInputIdConfirmation.update({
                      embed: [savedConfigInputIdEmbed],
                      components: [],
                    });
                  }
                }
              } catch (error) {
                console.log(error);
              }
            }
          } catch (error) {
            console.log(error);
            const guild = interaction.client.guilds.cache.get(currentConfig.serverId);
            const channel = guild.channels.cache.get(currentConfig.channelId);
            let string = `**Server Name:** ${guild.name} (${guild.id}) \n\n**Config**\n**Channel:** <#${channel.id}> | ${channel.name} (${channel.id})`;
            if (currentConfig.roleId) {
              const role = guild.roles.cache.get(currentConfig.roleId);
              if (role.id === guild.id) {
                string += `\n**Role:** @everyone | @everyone (${role.id})`;
              } else {
                string += `\n**Role:** <@&${role.id}> | ${role.name} (${role.id})`;
              }
            } else {
              string += `\n**Role:** None`;
            }
            string += `\n**Ghost Ping:** ${
              currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
            }`;
            string += `\n**Delete Messages:** ${
              currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
            }`;
            string += `\n**Disabled:** ${
              currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
            }`;
            const configEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.green)
              .setTitle(`Fun Fact Configs - ${currentConfig.serverId}`)
              .setDescription(string);
            await interaction.editReply({ embeds: [configEmbed], components: [row] });
          }
        }
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
          }> to report it\nError id - ${errorId}\nError Info - \`${error
            .toString()
            .replaceAll('Error: ', '')}\``
        )
        .setFooter({
          text: `by @kathund | ${config.discord.supportInvite} for support`,
          iconURL: config.other.logo,
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
