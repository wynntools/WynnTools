const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { generateServer, generateServerGraph } = require('../../functions/generateImage.js');
const { errorMessage, otherMessage } = require('../../functions/logger.js');
const { generateID, cleanMessage } = require('../../functions/helper.js');
const { getServer, getServers } = require('../../api/wynnCraftAPI.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Handles Everything to do with servers')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('get')
        .setDescription('Get a servers player count')
        .addStringOption((option) =>
          option
            .setName('server-id')
            .setDescription('The ID of the server you want to view the player count for')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      var subcommand = interaction.options.getSubcommand();
      let row = null;
      if (subcommand === 'get') {
        var id = interaction.options.getString('server-id');
        if (id === null) {
          var servers = await getServers();
          otherMessage(servers);
        } else {
          var server = await getServer(id);
          if (server.error) throw new Error(server.error);
          const graphButton = new ButtonBuilder()
            .setLabel('Player Count History')
            .setCustomId('server-graph')
            .setStyle(ButtonStyle.Primary);

          row = new ActionRowBuilder().addComponents(graphButton);

          var msg = await interaction.reply({ files: [await generateServer(server)], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (confirmation.customId == 'server-graph') {
              await confirmation.update({ components: [] });

              const graphButton12h = new ButtonBuilder()
                .setLabel('12h')
                .setCustomId('server-graph-12h')
                .setStyle(ButtonStyle.Primary);

              const graphButton7d = new ButtonBuilder()
                .setLabel('7d')
                .setCustomId('server-graph-7d')
                .setStyle(ButtonStyle.Primary);

              const graphButton14d = new ButtonBuilder()
                .setLabel('14d')
                .setCustomId('server-graph-14d')
                .setStyle(ButtonStyle.Primary);

              const graphButton30d = new ButtonBuilder()
                .setLabel('30d')
                .setCustomId('server-graph-30d')
                .setStyle(ButtonStyle.Primary);

              row = new ActionRowBuilder().addComponents(graphButton12h, graphButton7d, graphButton14d, graphButton30d);
              await interaction.editReply({ files: [await generateServerGraph(server, '12h')], components: [row] });
            }
          } catch (error) {
            var errorIdGraph = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdGraph}`);
            errorMessage(error);
          }
        }
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
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
          .setColor(config.discord.embeds.red)
          .setTitle('An error occurred')
          .setDescription(
            `Use </report-bug:${
              config.discord.commands['report-bug']
            }> to report it\nError id - ${errorId}\nError Info - \`${cleanMessage(error)}\``
          )
          .setFooter({ text: `by @kathund | ${config.discord.supportInvite} for support`, iconURL: config.other.logo });
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
