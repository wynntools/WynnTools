const { writeAt, toFixed, generateID, blacklistCheck, cleanMessage } = require('../functions/helper.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { commandMessage, errorMessage } = require('../functions/logger.js');
const config = require('../../config.json');
const fs = require('fs');

module.exports = {
  name: 'InteractionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
          try {
            var string = await interaction.commandName;
            if (interaction.options) {
              if (interaction.options._group) {
                string += ` ${await interaction.options.getSubcommandGroup()}`;
              }
              if (interaction.options._subcommand) {
                string += ` ${await interaction.options.getSubcommand()}`;
              }
              for (const option of interaction.options._hoistedOptions) {
                if (option.value && option.name) {
                  string += ` ${option.name}: ${option.value}`;
                }
              }
            }

            if (interaction.user.discriminator == '0') {
              commandMessage(`${interaction.user.username} (${interaction.user.id}) ran command ${string}`);
            } else {
              commandMessage(
                `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) ran command ${string}`
              );
            }
          } catch (error) {
            var errorIdLogger = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdLogger}`);
            errorMessage(error);
          }
          if (
            config.other.devMode &&
            !(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)
          ) {
            throw new Error('No Perms');
          }
          try {
            if (!config.discord.channels.noCommandTracking.includes(interaction.channel.id)) {
              var userData = JSON.parse(fs.readFileSync('data/userData.json'));
              let data;
              if (userData[interaction.user.id]) {
                data = {
                  commandsRun: userData[interaction.user.id].commandsRun + 1,
                  firstCommand: userData[interaction.user.id].firstCommand,
                  lastUpdated: toFixed(new Date().getTime() / 1000, 0),
                  commands: userData[interaction.user.id].commands,
                };
                const commands = data.commands;
                if (commands[interaction.commandName]) {
                  commands[interaction.commandName]++;
                } else {
                  commands[interaction.commandName] = 1;
                }
                await writeAt('data/userData.json', interaction.user.id, data);
              } else {
                data = {
                  commandsRun: 1,
                  firstCommand: toFixed(new Date().getTime() / 1000, 0),
                  lastUpdated: toFixed(new Date().getTime() / 1000, 0),
                  commands: { [interaction.commandName]: 1 },
                };
                await writeAt('data/userData.json', interaction.user.id, data);
              }
            }
          } catch (error) {
            var errorIdLogUserData = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdLogUserData}`);
            errorMessage(error);
          }
          try {
            var blacklistTest = await blacklistCheck(interaction.user.id);
            if (blacklistTest) {
              const blacklisted = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setDescription('You are blacklisted')
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              return await interaction.reply({ embeds: [blacklisted], ephemeral: true });
            }
            await command.execute(interaction);
          } catch (error) {
            if (String(error).includes('NO_ERROR_ID_')) {
              errorMessage(error);
              const errorEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setTitle('An error occurred')
                .setDescription(`Error Info - \`${cleanMessage(error)}\``)
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });
              const supportDisc = new ButtonBuilder()
                .setLabel('Support Discord')
                .setURL(config.discord.supportInvite)
                .setStyle(ButtonStyle.Link);
              const row = new ActionRowBuilder().addComponents(supportDisc);
              if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
              } else {
                return await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
              }
            } else {
              var errorIdBlacklistCheck = generateID(config.other.errorIdLength);
              errorMessage(`Error ID: ${errorIdBlacklistCheck}`);
              errorMessage(error);
              const errorEmbed = new EmbedBuilder()
                .setColor(config.discord.embeds.red)
                .setTitle('An error occurred')
                .setDescription(
                  `Use </report-bug:${
                    config.discord.commands['report-bug']
                  }> to report it\nError id - ${errorIdBlacklistCheck}\nError Info - \`${cleanMessage(error)}\``
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
              if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
              } else {
                await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
              }
            }
          }
        } catch (error) {
          if (String(error).includes('NO_ERROR_ID_')) {
            errorMessage(error);
            const errorEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setTitle('An error occurred')
              .setDescription(`Error Info - \`${cleanMessage(error)}\``)
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: config.other.logo,
              });
            const supportDisc = new ButtonBuilder()
              .setLabel('Support Discord')
              .setURL(config.discord.supportInvite)
              .setStyle(ButtonStyle.Link);
            const row = new ActionRowBuilder().addComponents(supportDisc);
            if (interaction.replied || interaction.deferred) {
              return await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            } else {
              return await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            }
          } else {
            var errorIdCheck = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdCheck}`);
            errorMessage(error);
            const errorEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setTitle('An error occurred')
              .setDescription(
                `Use </report-bug:${
                  config.discord.commands['report-bug']
                }> to report it\nError id - ${errorIdCheck}\nError Info - \`${cleanMessage(error)}\``
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
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            } else {
              await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            }
          }
        }
      }
      if (interaction.isButton()) {
        try {
          if (interaction.customId.includes('setupGuideFunFacts')) {
            const setupGuideCommand = interaction.client.commands.get('fun-facts');
            if (setupGuideCommand === undefined) {
              throw new Error(
                'Setup guide command is missing. Please make a bug report or join the support server and make a ticket'
              );
            }
            await setupGuideCommand.execute(interaction);
          }
        } catch (error) {
          if (String(error).includes('NO_ERROR_ID_')) {
            errorMessage(error);
            const errorEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setTitle('An error occurred')
              .setDescription(`Error Info - \`${cleanMessage(error)}\``)
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
            if (interaction.replied || interaction.deferred) {
              return await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            } else {
              return await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            }
          } else {
            var errorIdButtons = generateID(config.other.errorIdLength);
            errorMessage(`Error Id - ${errorIdButtons}`);
            errorMessage(error);
            const errorEmbed = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setTitle('An error occurred')
              .setDescription(
                `Use </report-bug:${
                  config.discord.commands['report-bug']
                }> to report it\nError id - ${errorIdButtons}\nError Info - \`${cleanMessage(error)}\``
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
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            } else {
              await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
            }
          }
        }
      }
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error Id - ${errorId}`);
      errorMessage(error);
    }
  },
};
