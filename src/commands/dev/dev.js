const {
  clearGenerateStatsCache,
  clearGenerateProfileImageCache,
  clearGenerateGuildCache,
  clearGenerateServerCache,
  clearGenerateServerGraphCache,
} = require('../../functions/generateImage.js');
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const {
  countStatsInDirectory,
  addNotation,
  writeAt,
  toFixed,
  generateID,
  cleanMessage,
} = require('../../functions/helper.js');
const { getGuild, clearWynnCraftCache, clearWynnCraftGuildCache } = require('../../api/wynnCraftAPI.js');
const { register, registerGuild, clearPixelicCache } = require('../../api/pixelicAPI.js');
const { getDiscordUsername, clearDiscordCache } = require('../../api/discordAPI.js');
const { getUsername, getUUID, clearMojangCache } = require('../../api/mojangAPI.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { errorMessage } = require('../../functions/logger.js');
const packageJson = require('../../../package.json');
const config = require('../../../config.json');
const hastebin = require('hastebin');
const path = require('path');
const fs = require('fs');

function checkFunFact(fact, startTime) {
  try {
    if (fact.lastSent + 1209600 < startTime) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    var errorIdCheckFact = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorIdCheckFact}`);
    errorMessage(error);
    return false;
  }
}

function getRandomFact(funFactList, blacklist) {
  try {
    const validFacts = funFactList.facts.filter((fact) => !blacklist.has(fact.id));
    if (validFacts.length === 0) {
      return null;
    }
    const randomFact = validFacts[Math.floor(Math.random() * validFacts.length)];
    return randomFact;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Developer commands (Dev Only)')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup((group) =>
      group
        .setName('blacklist')
        .setDescription('Blacklist a user')
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
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('clear-cache')
        .setDescription('Clear Cache')
        .addStringOption((option) =>
          option
            .setName('cache')
            .setDescription('The Cache you want to clear')
            .setRequired(true)
            .addChoices(
              { name: 'Mojang', value: 'mojang' },
              { name: 'WynnCraft', value: 'wynncraft' },
              { name: 'Wynncraft Guilds', value: 'wynncraftGuild' },
              { name: 'Discord', value: 'discord' },
              { name: 'Pixelic', value: 'pixelic' },
              { name: 'Generate Stats', value: 'clearGenerateStatsCache' },
              { name: 'Generate Profile Image', value: 'clearGenerateProfileImageCache' },
              { name: 'Generate Guild', value: 'clearGenerateGuildCache' },
              { name: 'Generate Server', value: 'clearGenerateServerCache' },
              { name: 'Generate Server Graph', value: 'clearGenerateServerGraphCache' },
              { name: 'All', value: 'all' }
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('embed')
        .setDescription('Handles everything with embeds')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('source')
            .setDescription('Returns the starb.in link of a given embed')
            .addStringOption((option) =>
              option
                .setName('message-link')
                .setDescription('The message link of which you would get the embed')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('send')
            .setDescription('Send an embed')
            .addStringOption((option) =>
              option.setName('embed').setDescription('The starb.in link for the embed').setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName('channel')
                .setDescription('the channel to send your embed in, if empty it will take the current channel')
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('edit')
            .setDescription('Edit an embed to a new embed')
            .addStringOption((option) =>
              option
                .setName('message-link')
                .setDescription("The link of the message you'd like to edit")
                .setRequired(true)
            )
            .addStringOption((option) => option.setName('embed').setDescription('The new embed').setRequired(true))
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('fun-facts')
        .setDescription('Fun Facts but the dev commands (Dev Only)')
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
        .addSubcommand((subcommand) => subcommand.setName('send').setDescription('force send fun facts'))
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
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName('register')
        .setDescription('Register a someone to the pixelic api')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('player')
            .setDescription('Register a player to the pixelic api')
            .addStringOption((option) =>
              option
                .setName('username')
                .setDescription('The Username of the person you want to register')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('guild')
            .setDescription('Register a guild to the pixelic api')
            .addStringOption((option) =>
              option.setName('guild').setDescription('The guild you want to register').setRequired(true)
            )
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('update-stats').setDescription('Update the stats embed')),

  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      var subCommandGroup = await interaction.options.getSubcommandGroup();
      var subCommand = await interaction.options.getSubcommand();
      if (subCommandGroup === 'blacklist') {
        let userMention;
        let userId;
        let user;
        var blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
        if (subCommand === 'add') {
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
          var blacklistInfo = {
            id: user.id,
            reason: reason,
            timestamp: toFixed(new Date().getTime() / 1000, 0),
            by: interaction.user.id,
          };
          await writeAt('data/blacklist.json', user.id, blacklistInfo);
          await interaction.reply({ content: 'User has been blacklisted', ephemeral: true });
        } else if (subCommand === 'remove') {
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
      } else if (subCommandGroup === 'embed') {
        if (subCommand === 'source') {
          const messageLink = interaction.options.getString('message-link');
          const messageLinkSplit = messageLink.split('/');
          const messageId = messageLinkSplit.pop();
          const channelId = messageLinkSplit.pop();
          const channel = await interaction.client.channels.fetch(channelId);
          const message = await channel.messages.fetch(messageId);
          const embedJson = message.embeds;
          if (embedJson[0] === undefined) {
            await interaction.editReply('This is not a valid embed!');
            return;
          }
          const link = await hastebin.createPaste(JSON.stringify(embedJson[0], 0, 4), {
            server: 'https://starb.in',
            dataType: 'js',
            contentType: '.json',
          });
          await interaction.editReply(link + '.json');
        } else if (subCommand === 'send') {
          const embedInput = interaction.options.getString('embed');
          const validHosts = ['starb.in'];
          if (validHosts.some((host) => embedInput.startsWith(`https://${host}`))) {
            const pathSegments = embedInput.split('/');
            if (!pathSegments.length >= 4 && pathSegments[3] === 'raw') return;
            const rawPath = pathSegments.slice(4).join('/');
            const url = `http://${validHosts[0]}/raw/${rawPath}`;
            const fetch = (...args) =>
              import('node-fetch')
                .then(({ default: fetch }) => fetch(...args))
                .catch((err) => errorMessage(err));
            const response = await fetch(url);
            const data = await response.text();
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;
            const embed = new EmbedBuilder(JSON.parse(data));
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `Successfully sent embed to ${channel}`, ephemeral: true });
          } else {
            const embedInput = interaction.options.getString('embed');
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;
            const embed = new EmbedBuilder(JSON.parse(embedInput));
            channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `Successfully sent embed to ${channel}`, ephemeral: true });
          }
        } else if (subCommand === 'edit') {
          const newEmbed = interaction.options.getString('embed');
          const messageLink = interaction.options.getString('message-link').split('/');
          const messageId = messageLink.pop();
          let embed = null;
          const channel = await interaction.client.channels.fetch(messageLink.pop());
          const message = await channel.messages.fetch(messageId);
          if (newEmbed.startsWith('https://')) {
            const fetch = (...args) =>
              import('node-fetch')
                .then(({ default: fetch }) => fetch(...args))
                .catch((err) => errorMessage(err));
            const url = `http://starb.in/raw/${newEmbed.split('.')[1].split('/')[1]}`;
            const response = await fetch(url);
            const data = await response.text();
            embed = new EmbedBuilder(JSON.parse(data));
          } else {
            embed = new EmbedBuilder(JSON.parse(newEmbed));
          }
          await message.edit({ embeds: [embed] });
          await interaction.editReply({
            content: `Successfully edited embed at ${interaction.options.getString('message-link')}`,
            ephemeral: true,
          });
        }
      } else if (subCommandGroup === 'fun-facts') {
        var startTime = Math.floor(Date.now() / 1000);
        const blacklist = new Set();
        const funFactList = JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'));
        const suggestedData = JSON.parse(fs.readFileSync('data/funFacts/suggested.json'));
        const listData = JSON.parse(fs.readFileSync('data/funFacts/list.json'));
        const factList = listData.facts;
        let i = 0;
        let list = '';
        let msg;
        if (subCommand === 'list') {
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
              .setColor(config.other.colors.green.hex)
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
              .setColor(config.other.colors.green.hex)
              .setTitle('Fun Facts List')
              .setDescription(list)
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            return await interaction.reply({ embeds: [listEmbed] });
          }
        } else if (subCommand === 'send') {
          const confirmEmbed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
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
                const totalFacts = Object.keys(JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'))).length;
                do {
                  funFact = getRandomFact(funFactList, blacklist);
                  if (funFact && checkFunFact(funFact, startTime)) {
                    /* empty */
                  } else if (funFact) {
                    blacklist.add(funFact.id);
                  }
                  numCheckedFacts++;
                } while (funFact && !checkFunFact(funFact, startTime) && numCheckedFacts < totalFacts);
                if (!funFact || (funFact && !checkFunFact(funFact, startTime))) {
                  return 'No valid fun facts found.';
                }
                const funFactConfigs = JSON.parse(fs.readFileSync('data/funFacts/config.json', 'utf8'));
                const funFactConfigsObject = Object.keys(funFactConfigs);
                const setup = new ButtonBuilder()
                  .setCustomId('setupGuideFunFacts')
                  .setLabel('How to setup')
                  .setStyle(ButtonStyle.Primary);
                const row = new ActionRowBuilder().addComponents(setup);
                var requestedByString = '';
                if (funFact.requestedBy && funFact.hidden != false) {
                  requestedByString = `Requested by ${await getDiscordUsername(funFact.requestedBy)} | `;
                }
                const funFactEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setDescription(
                    `**Today's Fun fact is** \n${funFact.fact}\n\n${requestedByString}Next fun fact <t:${
                      startTime + 86400
                    }:R>`
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
                      await channel.send({ embeds: [funFactEmbed], components: [row], content: role });
                    }
                  }
                  await delay(300);
                }
                await writeAt(
                  'data/funFacts/list.json',
                  'facts',
                  funFactList.facts.map((fact) => (fact.id === funFact.id ? { ...fact, lastSent: startTime } : fact))
                );
                await writeAt('data/funFacts/list.json', 'next', startTime + 86400);
              } catch (error) {
                var errorIdSendFacts = generateID(config.other.errorIdLength);
                errorMessage(`Error ID: ${errorIdSendFacts}`);
                errorMessage(error);
              }
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green.hex)
                .setDescription('Sent all Fun Facts')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              await confirmation.update({ embeds: [updatedEmbed], components: [] });
            } else if (confirmation.customId == 'funFactsDevSendCancel') {
              const cancelEmbed = new EmbedBuilder()
                .setColor(config.other.colors.red.hex)
                .setDescription('Cancelled sending Fun Facts')
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              await confirmation.update({ embeds: [cancelEmbed], components: [] });
            }
          } catch (error) {
            var errorIdSendingFacts = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdSendingFacts}`);
            errorMessage(error);
            const cancelEmbed = new EmbedBuilder()
              .setColor(config.other.colors.red.hex)
              .setDescription('Cancelled sending Fun Facts')
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.editReply({ embeds: [cancelEmbed], components: [] });
          }
        } else if (subCommand === 'view') {
          var facType = interaction.options.getString('type');
          var facId = interaction.options.getString('id');
          let fact;
          if (facType === 'list') {
            fact = listData[facId];
            if (!fact) throw new Error('Invalid ID');
            let requestedByString = '';
            if (fact.requestedBy && fact.hidden == false) {
              requestedByString = `Requested by ${await getDiscordUsername(fact.requestedBy)}`;
            }
            if (fact.lastSent > 0) {
              requestedByString = `${requestedByString} | Last sent <t:${fact.lastSent}:R>`;
            } else {
              requestedByString = `${requestedByString} | Never been sent`;
            }
            const factEmbed = new EmbedBuilder()
              .setColor(config.other.colors.green.hex)
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
              .setColor(config.other.colors.green.hex)
              .setTitle(`Fun Fact #${fact.id}`)
              .setDescription(
                `${fact.fact}\n\nRequested by ${await getDiscordUsername(fact.by)} | Requested at <t:${fact.at}:R>`
              )
              .setTimestamp()
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            await interaction.reply({ embeds: [factEmbed] });
          }
        } else if (subCommand === 'approve') {
          const id = interaction.options.getString('id');
          const fact = suggestedData[id];
          if (!fact) throw new Error('Invalid ID');
          if (suggestedData[id].notify) {
            const notifyEmbed = new EmbedBuilder()
              .setColor(config.other.colors.green.hex)
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
              .setColor(config.other.colors.green.hex)
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
              .setColor(config.other.colors.green.hex)
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
          await writeAt('data/funFacts/list.json', id, { requestedBy: fact.by, fact: fact.fact, id: id, lastSent: 0 });
          delete suggestedData[id];
          fs.writeFileSync('data/funFacts/suggested.json', JSON.stringify(suggestedData));
        } else if (subCommand === 'deny') {
          const id = interaction.options.getString('id');
          const fact = suggestedData[id];
          if (!fact) throw new Error('Invalid ID');
          if (suggestedData[id].notify) {
            const notifyEmbed = new EmbedBuilder()
              .setColor(config.other.colors.red.hex)
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
              .setColor(config.other.colors.red.hex)
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
              .setColor(config.other.colors.red.hex)
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
        } else if (subCommand === 'delete') {
          var id = interaction.options.getString('id');
          var fact = listData[id];
          if (!fact) throw new Error('Invalid ID');
          const factEmbed = new EmbedBuilder()
            .setColor(config.other.colors.red.hex)
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
        } else if (subCommand === 'configs') {
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
              .setColor(config.other.colors.green.hex)
              .setTitle(`Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${configsObject.length}`)
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
              .setEmoji('🔄')
              .setStyle(ButtonStyle.Secondary)
              .setCustomId('reloadButtonConfigs');
            const row = new ActionRowBuilder().addComponents(leftButton, editButton, rightButton, reloadButtonConfigs);
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
                    .setColor(config.other.colors.green.hex)
                    .setTitle(`Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${configsObject.length}`)
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
                    .setLabel(currentConfig.deleteMsgs ? 'Disable Delete Messages' : 'Enable Delete Messages')
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
                    .setColor(config.other.colors.green.hex)
                    .setTitle(`Edit Mode Enabled`)
                    .setDescription(string);
                  var editMessage = await interaction.followUp({
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
                          .setColor(config.other.colors.red.hex)
                          .setTitle('Config Deleted')
                          .setDescription(`The config for ${guild.name} (${guild.id}) has been deleted`)
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
                          currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Delete Messages:** ${
                          currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Disabled:** ${
                          currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        var ghostPingUpdateEmbed = new EmbedBuilder()
                          .setColor(config.other.colors.green.hex)
                          .setTitle('Edit Mode Enabled - PLEASE SAVE THE CONFIG')
                          .setDescription(string)
                          .setTimestamp()
                          .setFooter({
                            text: `by @kathund | ${config.discord.supportInvite} for support`,
                            iconURL: config.other.logo,
                          });
                        await editMessageConfirmation.update({ embeds: [ghostPingUpdateEmbed], components: [editRow] });
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
                          currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Delete Messages:** ${
                          currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Disabled:** ${
                          currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        var updatedDeleteMessageEmbed = new EmbedBuilder()
                          .setColor(config.other.colors.green.hex)
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
                          currentConfig.ghostPing ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Delete Messages:** ${
                          currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        string += `\n**Disabled:** ${
                          currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                        }`;
                        var disableEnableUpdateEmbed = new EmbedBuilder()
                          .setColor(config.other.colors.green.hex)
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
                          .setColor(config.other.colors.green.hex)
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
                    if (String(error).includes('NO_ERROR_ID_')) {
                      errorMessage(error);
                      const errorEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.red.hex)
                        .setTitle('An error occurred')
                        .setDescription(`Error Info - \`${cleanMessage(error)}\``)
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });
                      const supportDisc = new ButtonBuilder()
                        .setLabel('Support Discord')
                        .setURL(config.discord.supportInvite)
                        .setStyle(ButtonStyle.Link);
                      const row = new ActionRowBuilder().addComponents(supportDisc);
                      return await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
                    } else {
                      var errorIdUpdatingConfigs = generateID(config.other.errorIdLength);
                      errorMessage(`Error ID: ${errorIdUpdatingConfigs}`);
                      errorMessage(error);
                      const errorEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.red.hex)
                        .setTitle('An error occurred')
                        .setDescription(
                          `Use </report-bug:${
                            config.discord.commands['report-bug']
                          }> to report it\nError id - ${errorIdUpdatingConfigs}\nError Info - \`${cleanMessage(
                            error
                          )}\``
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
                      await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
                    }
                  }
                } else if (confirmation.customId === 'rightButtonConfigs') {
                  num = num + 1;
                  if (num >= configsObject.length) num = 0;
                  currentConfig = configs[configsObject[num]];
                  const guild = await interaction.client.guilds.cache.get(currentConfig.serverId);
                  const channel = await guild.channels.cache.get(currentConfig.channelId);
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
                    .setColor(config.other.colors.green.hex)
                    .setTitle(`Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${configsObject.length}`)
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
                    .setColor(config.other.colors.green.hex)
                    .setTitle(`Fun Fact Configs - ${currentConfig.serverId} - ${num + 1}/${configsObject.length}`)
                    .setDescription(string);
                  await confirmation.update({ embeds: [configEmbed], components: [row] });
                }
              }
            } catch (error) {
              var errorIdChangingConfigs = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdChangingConfigs}`);
              errorMessage(error);
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
              .setColor(config.other.colors.green.hex)
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
            var inputIdMessage = await interaction.reply({ embeds: [configEmbed], components: [row] });
            const collectorFilter = (i) => i.user.id === interaction.user.id;
            try {
              var inputIdConfirm = await inputIdMessage.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (inputIdConfirm.customId === 'editButtonConfig') {
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
                  .setLabel(currentConfig.deleteMsgs ? 'Disable Delete Messages' : 'Enable Delete Messages')
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
                  .setColor(config.other.colors.green.hex)
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
                    var editMessageInputIdConfirmation = await editInputIdMessage.awaitMessageComponent({
                      time: config.discord.buttonTimeout * 1000,
                      filter: collectorFilter,
                    });
                    if (editMessageInputIdConfirmation.customId === 'deleteConfigInputIdButton') {
                      delete configs[configsObject[num]];
                      fs.writeFileSync('data/funFacts/config.json', JSON.stringify(configs));
                      var configDeletedInputIdEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.red.hex)
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
                        currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      var ghostPingUpdateInputIdEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.green.hex)
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
                    } else if (editMessageInputIdConfirmation.customId === 'deleteMessagesInputIdButton') {
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
                        currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      var updatedDeleteMessageInputIdEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.green.hex)
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
                    } else if (editMessageInputIdConfirmation.customId === 'disableEnableInputIdButton') {
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
                        currentConfig.deleteMsgs ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      string += `\n**Disabled:** ${
                        currentConfig.disabled ? config.discord.emojis.yes : config.discord.emojis.no
                      }`;
                      var disableEnableUpdateInputIdEmbed = new EmbedBuilder()
                        .setColor(config.other.colors.green.hex)
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
                    } else if (editMessageInputIdConfirmation.customId === 'saveConfigInputIdButton') {
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
                        .setColor(config.other.colors.green.hex)
                        .setTitle(`Config has been saved for ${guild.name} (${guild.id})`)
                        .setDescription('Please click the refresh button to reload the config that is displayed above')
                        .setTimestamp()
                        .setFooter({
                          text: `by @kathund | ${config.discord.supportInvite} for support`,
                          iconURL: config.other.logo,
                        });
                      await editMessageInputIdConfirmation.update({ embed: [savedConfigInputIdEmbed], components: [] });
                    }
                  }
                } catch (error) {
                  var errorIdEditingConfigData = generateID(config.other.errorIdLength);
                  errorMessage(`Error ID: ${errorIdEditingConfigData}`);
                  errorMessage(error);
                }
              }
            } catch (error) {
              var errorIdEditConfig = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdEditConfig}`);
              errorMessage(error);
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
                .setColor(config.other.colors.green.hex)
                .setTitle(`Fun Fact Configs - ${currentConfig.serverId}`)
                .setDescription(string);
              await interaction.editReply({ embeds: [configEmbed], components: [row] });
            }
          }
        }
      } else if (subCommandGroup === 'register') {
        let registerData;
        let embed;
        if (subCommand === 'player') {
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
          if (registerData.status != 201) throw new Error(registerData.error);
          embed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle('User Registered')
            .setDescription(`User ${username} has been registered to the pixelic api`)
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
          return await interaction.reply({ embeds: [embed] });
        } else if (subCommand === 'guild') {
          var guildName = interaction.options.getString('guild');
          var guild = await getGuild(guildName);
          embed = new EmbedBuilder()
            .setColor(config.other.colors.orange.hex)
            .setTitle('Attempting to register guild')
            .setDescription(`Attempting to register guild ${guild.name} to the pixelic api`)
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
          await interaction.reply({ embeds: [embed] });
          registerData = await registerGuild(guild);
          embed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle('Guild Registered')
            .setDescription(`Successfully registered ${registerData}/${guild.totalMembers} members`)
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
          return await interaction.editReply({ embeds: [embed] });
        }
      } else if (subCommandGroup === null) {
        if (subCommand === 'clear-cache') {
          const cacheCategory = interaction.options.getString('cache');
          if (cacheCategory == 'mojang') {
            clearMojangCache();
            await interaction.reply({ content: 'Cleared Mojang Cache' });
          } else if (cacheCategory == 'wynncraft') {
            clearWynnCraftCache();
            await interaction.reply({ content: 'Cleared WynnCraft Cache' });
          } else if (cacheCategory == 'wynncraftGuild') {
            clearWynnCraftGuildCache();
            await interaction.reply({ content: 'Cleared WynnCraft Guild Cache' });
          } else if (cacheCategory == 'discord') {
            clearDiscordCache();
            await interaction.reply({ content: 'Cleared Discord Cache' });
          } else if (cacheCategory == 'pixelic') {
            clearPixelicCache();
            await interaction.reply({ content: 'Cleared Pixelic Cache' });
          } else if (cacheCategory === 'clearGenerateStatsCache') {
            clearGenerateStatsCache();
            await interaction.reply({ content: 'Cleared Generate Stats Cache' });
          } else if (cacheCategory === 'clearGenerateProfileImageCache') {
            clearGenerateProfileImageCache();
            await interaction.reply({ content: 'Cleared Generate Profile Image Cache' });
          } else if (cacheCategory === 'clearGenerateGuildCache') {
            clearGenerateGuildCache();
            await interaction.reply({ content: 'Cleared Generate Guild Cache' });
          } else if (cacheCategory === 'clearGenerateServerCache') {
            clearGenerateServerCache();
            await interaction.reply({ content: 'Cleared Generate Server Cache' });
          } else if (cacheCategory === 'clearGenerateServerGraphCache') {
            clearGenerateServerGraphCache();
            await interaction.reply({ content: 'Cleared Generate Server Graph Cache' });
          } else if (cacheCategory == 'all') {
            clearMojangCache();
            clearDiscordCache();
            clearPixelicCache();
            clearWynnCraftCache();
            clearWynnCraftGuildCache();
            clearGenerateStatsCache();
            clearGenerateProfileImageCache();
            clearGenerateGuildCache();
            clearGenerateServerCache();
            clearGenerateServerGraphCache();
            await interaction.reply({ content: 'Cleared All Caches' });
          } else {
            throw new Error('uhhh something went wrong');
          }
        } else if (subCommand === 'update-stats') {
          const { totalFiles, totalLines, totalCharacters, totalWhitespace } = countStatsInDirectory(process.cwd());
          const channel = await interaction.client.channels.fetch(config.discord.channels.stats);
          const message = await channel.messages.fetch(config.discord.messages.stats);
          var userData = JSON.parse(fs.readFileSync('data/userData.json'));
          var totalCommandsRun = 0;
          for (const entry in userData) {
            totalCommandsRun += userData[entry].commandsRun;
          }
          const genCommands = [];
          fs.readdirSync(path.resolve(__dirname, '../general')).forEach((file) => {
            if (!file.endsWith('.js')) return;
            if (file.toLowerCase().includes('disabled')) return;
            genCommands.push(file);
          });
          const devCommands = [];
          fs.readdirSync(path.resolve(__dirname, '../dev')).forEach((file) => {
            if (!file.endsWith('.js')) return;
            if (file.toLowerCase().includes('disabled')) return;
            devCommands.push(file);
          });
          const invite = new ButtonBuilder()
            .setLabel('invite')
            .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
            .setStyle(ButtonStyle.Link);
          const source = new ButtonBuilder()
            .setLabel('source')
            .setURL('https://github.com/Kathund/WynnTools')
            .setStyle(ButtonStyle.Link);
          const row = new ActionRowBuilder().addComponents(invite, source);
          var embed = new EmbedBuilder()
            .setTitle(`WynnTools Stats`)
            .setColor(config.other.colors.green.hex)
            .setTimestamp()
            .addFields(
              {
                name: 'General',
                value: `<:Dev:1130772126769631272> Developer - \`@kathund\`\n<:commands:1130772895891738706> Commands - \`${
                  genCommands.length
                } (${
                  devCommands.length
                } dev commands)\`\n<:commands:1130772895891738706> Total Commands Run - \`${totalCommandsRun}\`\n<:bullet:1064700156789927936> Version \`${
                  packageJson.version
                }\`\nServers - \`${await interaction.client.guilds.cache.size}\`\nUptime - <t:${global.uptime}:R>`,
                inline: true,
              },
              {
                name: 'Code Stats',
                value: `Files - \`${addNotation('oneLetters', totalFiles)}\`\nLines - \`${addNotation(
                  'oneLetters',
                  totalLines
                )}\`\nCharacters - \`${addNotation(
                  'oneLetters',
                  totalCharacters
                )}\`\nCharacters with out spaces - \`${addNotation('oneLetters', totalCharacters - totalWhitespace)}\``,
                inline: true,
              }
            )
            .setFooter({ text: `by @kathund | Stats maybe inaccurate/outdated/cached`, iconURL: config.other.logo });
          await message.edit({ embeds: [embed], components: [row] });
          await interaction.reply({ content: 'Updated Stats', ephemeral: true });
        }
      } else {
        // transfer funny code
        await interaction.reply({ content: 'This command is currently disabled' });
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red.hex)
          .setTitle('An error occurred')
          .setDescription(`Error Info - \`${cleanMessage(error)}\``)
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
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
          .setColor(config.other.colors.red.hex)
          .setTitle('An error occurred')
          .setDescription(
            `Use </report-bug:${
              config.discord.commands['report-bug']
            }> to report it\nError id - ${errorId}\nError Info - \`${cleanMessage(error)}\``
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
    }
  },
};
