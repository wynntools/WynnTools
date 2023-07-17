const { generateGuild } = require('../../functions/generateImage.js');
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
      var perms = ['608584543506530314', '501976955998961664', '728254498018951238', '894034804503351366'];
      if (!perms.includes(interaction.user.id)) {
        await interaction.reply({
          content: 'https://tenor.com/view/dad-daddy-zal%C3%A1n-apja-noel-apja-ao%C3%A1d-gif-25400675',
        });
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
