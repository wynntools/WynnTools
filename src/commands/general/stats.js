const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { generateStats, generateProfileImage } = require('../../functions/generateImage.js');
const { blacklistCheck, generateID } = require('../../helperFunctions.js');
const { getProfiles } = require('../../api/wynnCraftAPI.js');
const { getUUID } = require('../../api/mojangAPI.js');
const { errorMessage } = require('../../logger.js');
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
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
      const username = interaction.options.getString('username');
      const uuid = await getUUID(username);

      var profiles = await getProfiles(uuid);
      const sortedData = profiles.sort((a, b) => b.level - a.level);
      const options = sortedData.map((entry) => ({
        label: `${entry.type} - ${entry.level}`,
        value: entry.key,
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId('profileSelection')
        .setPlaceholder('Select what profile')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(select);

      var msg = await interaction.reply({ files: [await generateStats(uuid)], components: [row] });
      const filter = (i) => i.isStringSelectMenu(i);

      const keepAlive = 15;
      const collector = msg.createMessageComponentCollector({
        filter,
        time: keepAlive * 1000,
      });

      collector.on('collect', async function (i) {
        const selectedProfile = i.values[0];
        await i.update({
          files: [await generateProfileImage(uuid, selectedProfile)],
          components: [row],
        });
      });
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
