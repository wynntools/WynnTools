const {
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { generateProfileImage } = require('../../functions/generateImage.js');
const { generateID, cleanMessage } = require('../../functions/helper.js');
const { errorMessage } = require('../../functions/logger.js');
const { getProfiles } = require('../../api/wynnCraftAPI.js');
const { getUUID } = require('../../api/mojangAPI.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display Stats about a user')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('username').setDescription('Username of user you want to see the stats for').setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      const username = interaction.options.getString('username');
      const uuid = await getUUID(username);
      var profiles = await getProfiles(uuid);
      if (profiles === 'Player has no stats') throw new Error('NO_ERROR_ID_Player has no stats');
      const sortedProfiles = profiles.sort((a, b) => b.totalLevel - a.totalLevel);
      if (sortedProfiles.length === 1) {
        return await interaction.editReply({
          files: [await generateProfileImage(uuid, sortedProfiles[0].key)],
        });
      } else {
        const options = sortedProfiles.map((entry) => ({
          label: `${entry.nickname ? `${entry.nickname} (${entry.formattedType})` : entry.formattedType} - ${
            entry.totalLevel
          }`,
          value: entry.key,
        }));
        const select = new StringSelectMenuBuilder()
          .setCustomId('profileSelection')
          .setPlaceholder('Select what profile')
          .addOptions(options);
        const row = new ActionRowBuilder().addComponents(select);
        var msg = await interaction.editReply({
          files: [await generateProfileImage(uuid, sortedProfiles[0].key)],
          components: [row],
        });
        const filter = (i) => i.isStringSelectMenu(i);
        const collector = msg.createMessageComponentCollector({ time: config.discord.buttonTimeout * 1000, filter });
        collector.on('collect', async function (i) {
          const selectedProfile = i.values[0];
          await i.update({ files: [await generateProfileImage(uuid, selectedProfile)], components: [row] });
        });
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
        if (interaction.replied || interaction.deferred) {
          return await interaction.editReply({ embeds: [errorEmbed], rows: [row] });
        } else {
          return await interaction.reply({ embeds: [errorEmbed], rows: [row] });
        }
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
        return await interaction.reply({ embeds: [errorEmbed], rows: [row] });
      }
    }
  },
};
