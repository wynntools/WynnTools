const { writeAt, blacklistCheck } = require('../../helperFunctions.js');
const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user (Dev Only)')
    .setDMPermission(true)
    .addUserOption(option => option.setName('target').setDescription('The user').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for the blacklist').setRequired(false)),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        await interaction.reply({ content: 'You are blacklisted' });
        return;
      }
      if (!interaction.user.id == config.discord.devId) {
        await interaction.reply({ content: 'No Perms?'});
        return;
      }
      const user = interaction.options.getMember('target');
      const reason = interaction.options.getString('reason');
      if (reason == null) reason = 'No reason provided';
      var blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
      if (blacklist.includes(user.id)) {
        await interaction.reply({ content: 'User is already blacklisted' });
        return;
      }
      var blacklistInfo = {
        id: user.id,
        reason: reason,
        timestamp: Date.now(),
      }
      await writeAt('data/blacklist.json', user.id, blacklistInfo);
      await interaction.reply({ content: 'User has been blacklisted' });
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
