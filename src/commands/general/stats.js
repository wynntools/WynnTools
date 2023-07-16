const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { generateStats, generateProfileImage } = require('../../functions/generateImage.js');
const { getProfiles } = require('../../api/wynnCraftAPI.js');
const { getUUID } = require('../../api/mojangAPI.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display Stats about a user')
    .addStringOption((option) =>
      option.setName('username').setDescription('Username of user you want to see the stats for').setRequired(true)
    ),
  async execute(interaction) {
    try {
      var perms = ['608584543506530314', '501976955998961664', '728254498018951238', '894034804503351366'];
      if (!perms.includes(interaction.user.id)) {
        await interaction.reply({
          content: 'https://tenor.com/view/dad-daddy-zal%C3%A1n-apja-noel-apja-ao%C3%A1d-gif-25400675',
        });
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
