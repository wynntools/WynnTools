const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { capitalizeFirstLetter, generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
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
          .setDescription('User has no data')
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        await interaction.reply({ embeds: [invalid], ephemeral: true });
        return;
      } else {
        var embed;
        var commandsSorted = Object.keys(userData[user.id].commands).sort(function (a, b) {
          return userData[user.id].commands[b] - userData[user.id].commands[a];
        });
        var string = '';
        var num = 9;
        if (commandsSorted.length < 10) {
          num = commandsSorted.length;
        }
        for (var i = 0; i < num; i++) {
          string += `<:arrowright:1132130283613868112> **${capitalizeFirstLetter(
            commandsSorted[i]
          )}:** \`${userData[user.id].commands[commandsSorted[i]]}\`\n`;
        }
        if (blacklist[user.id]) {
          embed = new EmbedBuilder()
            .setTitle(`Information for ${user.username} | ${user.id}`)
            .setColor(config.discord.embeds.green)
            .setTimestamp()
            .addFields({
              name: 'General',
              value: `<:commands:1130772895891738706> Commands Run - \`${
                userData[user.id].commandsRun
              }\`\nFirst command ran - <t:${userData[user.id].firstCommand}:f> (<t:${
                userData[user.id].firstCommand
              }:R>)`,
              inline: true,
            })
            .addFields({
              name: 'Blacklist',
              value: `Added - <t:${blacklist[user.id].timestamp}:f> (<t:${
                blacklist[user.id].timestamp
              }:R>)\nReason - ${blacklist[user.id].reason}`,
              inline: true,
            })
            .addFields({ name: 'Commands', value: string, inline: false })
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
        } else {
          embed = new EmbedBuilder()
            .setTitle(`Information for ${user.username} | ${user.id}`)
            .setColor(config.discord.embeds.green)
            .setTimestamp()
            .addFields({
              name: 'General',
              value: `<:commands:1130772895891738706> Commands Run - \`${
                userData[user.id].commandsRun
              }\`\nFirst command ran - <t:${userData[user.id].firstCommand}:f> (<t:${
                userData[user.id].firstCommand
              }:R>)`,
              inline: true,
            })
            .addFields({ name: 'Commands', value: string, inline: false })
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });
        }
        const deleteData = new ButtonBuilder()
          .setCustomId('deleteData')
          .setLabel('Delete data')
          .setStyle(ButtonStyle.Danger);
        const yes = new ButtonBuilder()
          .setCustomId('yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Danger);
        const cancel = new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(deleteData);
        const confirmRow = new ActionRowBuilder().addComponents(yes, cancel);
        var msg;
        if (interaction.user.id !== user.id) {
          msg = await interaction.reply({ embeds: [embed] });
        } else {
          msg = await interaction.reply({ embeds: [embed], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });
            if (confirmation.customId == 'deleteData') {
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setTimestamp()
                .setDescription(
                  'Are you sure you want to delete your data? **THIS CANNOT BE UNDONE!**'
                );
              await confirmation.update({ embeds: [updatedEmbed], components: [confirmRow] });
              const collectorFilter = (i) => i.user.id === interaction.user.id;
              try {
                const confirmation = await msg.awaitMessageComponent({
                  time: config.discord.buttonTimeout * 1000,
                  filter: collectorFilter,
                });
                if (confirmation.customId == 'yes') {
                  delete userData[user.id];
                  fs.writeFileSync('data/userData.json', JSON.stringify(userData));
                  const updatedEmbed = new EmbedBuilder()
                    .setColor(config.discord.embeds.red)
                    .setTimestamp()
                    .setDescription('Data deleted');
                  return await confirmation.update({ embeds: [updatedEmbed], components: [] });
                } else if (confirmation.customId == 'cancel') {
                  const updatedEmbed = new EmbedBuilder()
                    .setColor(config.discord.embeds.red)
                    .setTimestamp()
                    .setDescription('Cancelled');
                  return await confirmation.update({ embeds: [updatedEmbed], components: [] });
                }
              } catch (e) {
                await interaction.editReply({ embeds: [embed], components: [] });
              }
            }
          } catch (e) {
            await interaction.editReply({ embeds: [embed], components: [] });
          }
        }
      }
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
          }> to report it\nError id - ${errorId}\nError Info - \`${error
            .toString()
            .replaceAll('Error: ', '')}\``
        )
        .setFooter({
          text: `by @kathund | ${config.discord.supportInvite} for support`,
          iconURL: config.other.logo,
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
