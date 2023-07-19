const { generateGuild } = require('../../functions/generateImage.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const { getGuild } = require('../../api/wynnCraftAPI.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Displays the statistics of the specified guild.')
    .setDMPermission(false)
    .addStringOption((option) => option.setName('name').setDescription("The guild's name.").setRequired(true)),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | discord.gg/kathund for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
      var name = interaction.options.getString('name');

      var guild = await getGuild(name);
      if (guild.status != 200) {
        await interaction.reply({ content: guild.error });
      } else {
        await interaction.reply({ files: [await generateGuild(guild)] });
      }
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
