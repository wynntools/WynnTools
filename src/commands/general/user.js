const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { blacklistCheck, capitalizeFirstLetter } = require('../../helperFunctions.js');
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
          .setDescription('User has no data')
          .setFooter({
            text: `by @kathund | discord.gg/kathund for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [invalid], ephemeral: true });
        return;
      } else {
        var embed;
        // make a variable called top5Commands that has all the commands that the user had used in order from most used to least used
        var commandsSorted = Object.keys(userData[user.id].commands).sort(function (a, b) {
          return userData[user.id].commands[b] - userData[user.id].commands[a];
        });
        var string = '';
        // for every item in commandsSorted add it to the string and the value of the command
        var num = 9;
        if (commandsSorted.length < 10) {
          num = commandsSorted.length;
        }
        for (var i = 0; i < num; i++) {
          string += `<:arrowright:1132130283613868112> **${capitalizeFirstLetter(commandsSorted[i])}:** \`${
            userData[user.id].commands[commandsSorted[i]]
          }\`\n`;
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
              value: `Added - <t:${blacklist[user.id].timestamp}:f> (<t:${blacklist[user.id].timestamp}:R>)\nReason - ${
                blacklist[user.id].reason
              }`,
              inline: true,
            })
            .addFields({
              name: 'Commands',
              value: string,
              inline: false,
            })
            .setFooter({
              text: `by @kathund | discord.gg/kathund for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
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
            .addFields({
              name: 'Commands',
              value: string,
              inline: false,
            })
            .setFooter({
              text: `by @kathund | discord.gg/kathund for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });
        }

        const deleteData = new ButtonBuilder()
          .setCustomId('deleteData')
          .setLabel('Delete data')
          .setStyle(ButtonStyle.Danger);

        const yes = new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Danger);
        const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(deleteData);
        const confirmRow = new ActionRowBuilder().addComponents(yes, cancel);
        var msg;
        if (interaction.user.id !== user.id) {
          msg = await interaction.reply({
            embeds: [embed],
          });
        } else {
          msg = await interaction.reply({ embeds: [embed], components: [row] });

          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            const confirmation = await msg.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            if (confirmation.customId == 'deleteData') {
              const updatedEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setTimestamp()
                .setDescription('Are you sure you want to delete your data? **THIS CANNOT BE UNDONE!**');

              await confirmation.update({
                embeds: [updatedEmbed],
                components: [confirmRow],
              });

              const collectorFilter = (i) => i.user.id === interaction.user.id;
              try {
                const confirmation = await msg.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                if (confirmation.customId == 'yes') {
                  delete userData[user.id];
                  fs.writeFileSync('data/userData.json', JSON.stringify(userData));
                  const updatedEmbed = new EmbedBuilder()
                    .setColor(config.discord.embeds.red)
                    .setTimestamp()
                    .setDescription('Data deleted');

                  return await confirmation.update({
                    embeds: [updatedEmbed],
                    components: [],
                  });
                } else if (confirmation.customId == 'cancel') {
                  const updatedEmbed = new EmbedBuilder()
                    .setColor(config.discord.embeds.red)
                    .setTimestamp()
                    .setDescription('Cancelled');

                  return await confirmation.update({
                    embeds: [updatedEmbed],
                    components: [],
                  });
                }
              } catch (e) {
                await interaction.editReply({
                  embeds: [embed],
                  components: [],
                });
              }
            }
          } catch (e) {
            await interaction.editReply({
              embeds: [embed],
              components: [],
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
