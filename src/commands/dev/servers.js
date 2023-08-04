const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { generateServer, generateServerGraph } = require('../../functions/generateImage.js');
const { blacklistCheck, generateID } = require('../../helperFunctions.js');
const { getServer, getServers } = require('../../api/wynnCraftAPI.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('Fun Facts but the dev commands (Dev Only)')
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
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) throw new Error('You are blacklisted');
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      var subcommand = interaction.options.getSubcommand();
      if (subcommand === 'get') {
        var id = interaction.options.getString('server-id');
        if (id === null) {
          var servers = await getServers();
          console.log(servers);
        } else {
          var server = await getServer(id);
          if (server.error) throw new Error(server.error);
          console.log(server);
          const graphButton = new ButtonBuilder()
            .setLabel('Player Count History')
            .setCustomId('server-graph')
            .setStyle(ButtonStyle.Primary);

          const row = new ActionRowBuilder().addComponents(graphButton);

          var msg = await interaction.reply({ files: [await generateServer(server)], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({ filter: collectorFilter, time: 15_000 });
            if (confirmation.customId == 'server-graph') {
              await confirmation.update({ components: [] });
              await interaction.editReply({ files: [await generateServerGraph(server)] });
            }
          } catch (error) {
            console.log(error);
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
