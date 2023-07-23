const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { generateStats, generateProfileImage } = require('../../functions/generateImage.js');
const { blacklistCheck } = require('../../helperFunctions.js');
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
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
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
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
