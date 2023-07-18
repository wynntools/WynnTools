const { generateGuild } = require('../../functions/generateImage.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Search a guild and display there stats')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('name').setDescription('Name of the guild you want to view stats off').setRequired(true)
    ),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        await interaction.reply({ content: 'You are blacklisted' });
        return;
      }
      var name = interaction.options.getString('name');
      await interaction.reply({ files: [await generateGuild(name)] });
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
