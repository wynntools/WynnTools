const {
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { generateStats, generateProfileImage } = require('../../functions/generateImage.js');
const { generateID, cleanMessage } = require('../../functions/helper.js');
const { errorMessage } = require('../../functions/logger.js');
const { getProfiles } = require('../../api/wynnCraftAPI.js');
const { register } = require('../../api/pixelicAPI.js');
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
      const username = interaction.options.getString('username');
      const uuid = await getUUID(username);
      var profiles = await getProfiles(uuid);
      const sortedData = profiles.sort((a, b) => b.level - a.level);
      const options = sortedData.map((entry) => ({ label: `${entry.type} - ${entry.level}`, value: entry.key }));
      const select = new StringSelectMenuBuilder()
        .setCustomId('profileSelection')
        .setPlaceholder('Select what profile')
        .addOptions(options);
      const row = new ActionRowBuilder().addComponents(select);
      var msg = await interaction.reply({ files: [await generateStats(uuid)], components: [row] });
      const filter = (i) => i.isStringSelectMenu(i);
      const collector = msg.createMessageComponentCollector({ time: config.discord.buttonTimeout * 1000, filter });
      collector.on('collect', async function (i) {
        const selectedProfile = i.values[0];
        await i.update({ files: [await generateProfileImage(uuid, selectedProfile)], components: [row] });
      });
      await register(uuid);
    } catch (error) {
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
  },
};
