const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Shows info about you or a selected user')
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName('user').setDescription('The user you want to look up').setRequired(false)
    ),
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
      if (!interaction.user.id == config.discord.devId) {
        await interaction.reply({ content: 'No Perms?', ephemeral: true });
        return;
      }
      var user = interaction.options.getUser('user');
      if (user == null) user = interaction.user;

      var userData = JSON.parse(fs.readFileSync('data/userData.json'));
      var blacklist = JSON.parse(fs.readFileSync('data/blacklist.json'));
      if (userData[user.id] == undefined) {
        const invalid = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('User not found')
          .setFooter({
            text: `by @kathund | discord.gg/kathund for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [invalid], ephemeral: true });
        return;
      } else {
        var embed;
        if (blacklist[user.id]) {
          embed = new EmbedBuilder()
            .setTitle(`Information for <@${user.id}>`)
            .setColor(config.discord.embed.green)
            .setTimestamp()
            .addFields({
              name: '<:invis:1064700091778220043>',
              value: `<:commands:1130772895891738706> Commands Run - \`${
                userData[user.id].commandsRun
              }\nFirst command ran - <t:${userData[user.id].firstCommand}:f> (<t:${userData[user.id].firstCommand}:R>)`,
              inline: true,
            })
            .addFields({
              name: '<:invis:1064700091778220043>',
              value: `Blacklisted - <t:${blacklist[user.id].timestamp}:f> (<t:${
                blacklist[user.id].timestamp
              }:R>)\nReason - ${blacklist[user.id].reason}`,
              inline: true,
            })
            .setFooter({
              text: `by @kathund | discord.gg/kathund for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
          await interaction.reply({ embeds: [embed] });
        } else {
          embed = new EmbedBuilder()
            .setTitle(`Information for <@${user.id}>`)
            .setColor(config.discord.embed.green)
            .setTimestamp()
            .addFields({
              name: '<:invis:1064700091778220043>',
              value: `<:commands:1130772895891738706> Commands Run - \`${
                userData[user.id].commandsRun
              }\nFirst command ran - <t:${userData[user.id].firstCommand}:f> (<t:${userData[user.id].firstCommand}:R>)`,
              inline: true,
            })
            .setFooter({
              text: `by @kathund | discord.gg/kathund for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
          await interaction.reply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
