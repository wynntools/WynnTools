const { generateGuild } = require('../../functions/generateImage.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const { SlashCommandBuilder } = require('discord.js');

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
