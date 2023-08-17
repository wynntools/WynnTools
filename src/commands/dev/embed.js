const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
const hastebin = require('hastebin');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDMPermission(false)
    .setDescription('Handles everything with embeds')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
          option
            .setName('embed')
            .setDescription('The starb.in link for the embed')
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription(
              'the channel to send your embed in, if empty it will take the current channel'
            )
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
        .addStringOption((option) =>
          option.setName('embed').setDescription('The new embed').setRequired(true)
        )
    ),
  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      await interaction.deferReply();
      if (
        !(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(
          config.discord.roles.dev
        )
      ) {
        throw new Error('No Perms');
      }
      if (subcommand === 'source') {
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
      } else if (subcommand === 'send') {
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
              .catch((err) => console.log(err));
          const response = await fetch(url);
          const data = await response.text();
          const channel = interaction.options.getChannel('channel') ?? interaction.channel;
          const embed = new EmbedBuilder(JSON.parse(data));
          try {
            await channel.send({ embeds: [embed] });
            await interaction.editReply({
              content: `Successfully sent embed to ${channel}`,
              ephemeral: true,
            });
          } catch (error) {
            console.error(error);
            interaction.editReply('This is not a valid embed!');
          }
        } else {
          const embedInput = interaction.options.getString('embed');
          const channel = interaction.options.getChannel('channel') ?? interaction.channel;
          const embed = new EmbedBuilder(JSON.parse(embedInput));
          channel.send({ embeds: [embed] });
          await interaction.editReply({
            content: `Successfully sent embed to ${channel}`,
            ephemeral: true,
          });
        }
      } else if (subcommand === 'edit') {
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
              .catch((err) => console.log(err));
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
