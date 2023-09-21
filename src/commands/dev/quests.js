const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { getStats, getHighestProfile } = require('../../api/wynnCraftAPI.js');
const { generateID, cleanMessage } = require('../../functions/helper.js');
const { errorMessage } = require('../../functions/logger.js');
const config = require('../../../config.json');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quests')
    .setDescription('Quest Commands')
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Shows a list of all quests')
        .addStringOption((option) =>
          option
            .setName('sort')
            .setDescription('The Type of sort to use')
            .setRequired(false)
            .addChoices(
              { name: 'Xp', value: 'xp' },
              { name: 'Emeralds', value: 'emeralds' },
              { name: 'Combat Min Lvl', value: 'combatMinLvl' },
              { name: 'Mining Min Lvl', value: 'miningMinLvl' },
              { name: 'Wood Cutting Min Lvl', value: 'woodCuttingMinLvl' },
              { name: 'Farming Min Lvl', value: 'farmingMinLvl' },
              { name: 'Fishing Min Lvl', value: 'fishingMinLvl' },
              { name: 'Name', value: 'name' }
            )
        )
        .addBooleanOption((option) =>
          option
            .setName('completed')
            .setDescription('Show/Hide Completed Quests (This Requires a username)')
            .setRequired(false)
        )
        .addStringOption((option) =>
          option.setName('username').setDescription('The username to check').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('dungeon').setDescription('Hide Dungeon Quests').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('special').setDescription('Hide Special Quests').setRequired(false)
        )
        .addBooleanOption((option) => option.setName('normal').setDescription('Hide Normal Quests').setRequired(false))
        .addBooleanOption((option) => option.setName('event').setDescription('Hide Event Quests').setRequired(false))
    ),

  async execute(interaction) {
    try {
      if (!(await interaction.guild.members.fetch(interaction.user)).roles.cache.has(config.discord.roles.dev)) {
        throw new Error('No Perms');
      }
      const subcommand = await interaction.options.getSubcommand();
      if (subcommand === 'list') {
        const quests = JSON.parse(fs.readFileSync('data/quests.json'));
        const sort = interaction.options.getString('sort') || 'name';
        let sortedQuests = quests.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === 'xp') {
          sortedQuests = quests.sort((a, b) => b.xp - a.xp);
        } else if (sort === 'emeralds') {
          sortedQuests = quests.sort((a, b) => b.emeralds - a.emeralds);
        } else if (sort === 'combatMinLvl') {
          sortedQuests = quests.sort((a, b) => b.combatMinLvl - a.combatMinLvl);
        } else if (sort === 'miningMinLvl') {
          sortedQuests = quests.sort((a, b) => b.miningMinLvl - a.miningMinLvl);
        } else if (sort === 'woodCuttingMinLvl') {
          sortedQuests = quests.sort((a, b) => b.woodCuttingMinLvl - a.woodCuttingMinLvl);
        } else if (sort === 'farmingMinLvl') {
          sortedQuests = quests.sort((a, b) => b.farmingMinLvl - a.farmingMinLvl);
        } else if (sort === 'fishingMinLvl') {
          sortedQuests = quests.sort((a, b) => b.fishingMinLvl - a.fishingMinLvl);
        } else if (sort === 'name') {
          sortedQuests = quests.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          sortedQuests = quests.sort((a, b) => a.name.localeCompare(b.name));
        }
        const completedFilter = interaction.options.getBoolean('completed') || false;
        const dungeonFilter = interaction.options.getBoolean('dungeon') || false;
        const specialFilter = interaction.options.getBoolean('special') || false;
        const normalFilter = interaction.options.getBoolean('normal') || false;
        const eventFilter = interaction.options.getBoolean('event') || false;
        const username = interaction.options.getString('username') || null;
        let filteredQuests = sortedQuests;
        if (
          (dungeonFilter && specialFilter) ||
          (dungeonFilter && normalFilter) ||
          (dungeonFilter && eventFilter) ||
          (specialFilter && normalFilter) ||
          (specialFilter && eventFilter) ||
          (normalFilter && eventFilter)
        ) {
          throw new Error('NO_ERROR_ID_Please only select one filter at a time (Completed is not counted)');
        }
        if (completedFilter && username == null) {
          throw new Error('NO_ERROR_ID_You need to provide a username to use the completed filter');
        }
        if (dungeonFilter) {
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Dungeon');
        }
        if (specialFilter) {
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Special');
        }
        if (normalFilter) {
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Normal');
        }
        if (eventFilter) {
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Event');
        }
        let num = 0;
        let currentQuest = filteredQuests[num];
        if (completedFilter) {
          const stats = await getStats(username);
          var currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];
          var completedQuests = currentProfileStats.quests;
          filteredQuests.forEach((quest) => {
            if (completedQuests.includes(quest.name)) {
              quest.completed = true;
            } else {
              quest.completed = false;
            }
          });

          const questEmbed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
            .setDescription(
              `Quest Filters:\nDungeon Filter: ${
                dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nSpecial Filter: ${
                specialFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                completedFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nSort: ${sort}`
            )
            .setFields(
              {
                name: 'Name',
                value: currentQuest.name,
                inline: true,
              },
              {
                name: 'Completed',
                value: currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no,
                inline: true,
              },
              {
                name: 'Xp',
                value: currentQuest.xp,
                inline: true,
              },
              {
                name: 'Emeralds',
                value: currentQuest.emeralds,
                inline: true,
              },
              {
                name: 'Combat Min Lvl',
                value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                inline: true,
              },
              {
                name: 'Mining Min Lvl',
                value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                inline: true,
              },
              {
                name: 'Wood Cutting Min Lvl',
                value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                inline: true,
              },
              {
                name: 'Farming Min Lvl',
                value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                inline: true,
              },
              {
                name: 'Fishing Min Lvl',
                value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                inline: true,
              },
              {
                name: 'Type',
                value: currentQuest.type,
                inline: true,
              },
              {
                name: 'Length',
                value: currentQuest.length,
                inline: true,
              },
              {
                name: 'Main Province',
                value: currentQuest.mainProvince,
                inline: true,
              }
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });

          const leftButton = new ButtonBuilder()
            .setEmoji(config.other.emojis.left)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('leftButtonQuests');

          const rightButton = new ButtonBuilder()
            .setEmoji(config.other.emojis.right)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('rightButtonQuests');

          const row = new ActionRowBuilder().addComponents(leftButton, rightButton);

          const message = await interaction.reply({ embeds: [questEmbed], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            while (true) {
              var confirmationCompletedFilter = await message.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (confirmationCompletedFilter.customId === 'leftButtonQuests') {
                num = num - 1;
                if (num <= 0) num = filteredQuests.length - 1;
                currentQuest = filteredQuests[num];

                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `Quest Filters:\nDungeon Filter: ${
                      dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSpecial Filter: ${
                      specialFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                      completedFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSort: ${sort}`
                  )
                  .setFields(
                    {
                      name: 'Name',
                      value: currentQuest.name,
                      inline: true,
                    },
                    {
                      name: 'Xp',
                      value: currentQuest.xp,
                      inline: true,
                    },
                    {
                      name: 'Emeralds',
                      value: currentQuest.emeralds,
                      inline: true,
                    },
                    {
                      name: 'Combat Min Lvl',
                      value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Mining Min Lvl',
                      value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Wood Cutting Min Lvl',
                      value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Farming Min Lvl',
                      value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Fishing Min Lvl',
                      value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Type',
                      value: currentQuest.type,
                      inline: true,
                    },
                    {
                      name: 'Length',
                      value: currentQuest.length,
                      inline: true,
                    },
                    {
                      name: 'Main Province',
                      value: currentQuest.mainProvince,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await confirmationCompletedFilter.update({ embeds: [questEmbed], components: [row] });
              } else if (confirmationCompletedFilter.customId === 'rightButtonQuests') {
                num = num + 1;
                if (num <= 0) num = filteredQuests.length - 1;
                currentQuest = filteredQuests[num];

                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `Quest Filters:\nDungeon Filter: ${
                      dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSpecial Filter: ${
                      specialFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                      completedFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSort: ${sort}`
                  )
                  .setFields(
                    {
                      name: 'Name',
                      value: currentQuest.name,
                      inline: true,
                    },
                    {
                      name: 'Xp',
                      value: currentQuest.xp,
                      inline: true,
                    },
                    {
                      name: 'Emeralds',
                      value: currentQuest.emeralds,
                      inline: true,
                    },
                    {
                      name: 'Combat Min Lvl',
                      value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Mining Min Lvl',
                      value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Wood Cutting Min Lvl',
                      value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Farming Min Lvl',
                      value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Fishing Min Lvl',
                      value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Type',
                      value: currentQuest.type,
                      inline: true,
                    },
                    {
                      name: 'Length',
                      value: currentQuest.length,
                      inline: true,
                    },
                    {
                      name: 'Main Province',
                      value: currentQuest.mainProvince,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await confirmationCompletedFilter.update({ embeds: [questEmbed], components: [row] });
              }
            }
          } catch (error) {
            var errorIdButtonsComplete = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdButtonsComplete}`);
            errorMessage(error);
          }
        } else {
          const questEmbed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
            .setDescription(
              `Quest Filters:\nDungeon Filter: ${
                dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nSpecial Filter: ${
                specialFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                completedFilter ? config.other.emojis.yes : config.other.emojis.no
              }\nSort: ${sort}`
            )
            .setFields(
              {
                name: 'Name',
                value: currentQuest.name,
                inline: true,
              },
              {
                name: 'Xp',
                value: currentQuest.xp,
                inline: true,
              },
              {
                name: 'Emeralds',
                value: currentQuest.emeralds,
                inline: true,
              },
              {
                name: 'Combat Min Lvl',
                value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                inline: true,
              },
              {
                name: 'Mining Min Lvl',
                value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                inline: true,
              },
              {
                name: 'Wood Cutting Min Lvl',
                value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                inline: true,
              },
              {
                name: 'Farming Min Lvl',
                value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                inline: true,
              },
              {
                name: 'Fishing Min Lvl',
                value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                inline: true,
              },
              {
                name: 'Type',
                value: currentQuest.type,
                inline: true,
              },
              {
                name: 'Length',
                value: currentQuest.length,
                inline: true,
              },
              {
                name: 'Main Province',
                value: currentQuest.mainProvince,
                inline: true,
              }
            )
            .setTimestamp()
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: config.other.logo,
            });

          const leftButton = new ButtonBuilder()
            .setEmoji(config.other.emojis.left)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('leftButtonQuests');

          const rightButton = new ButtonBuilder()
            .setEmoji(config.other.emojis.right)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('rightButtonQuests');

          const row = new ActionRowBuilder().addComponents(leftButton, rightButton);

          const message = await interaction.reply({ embeds: [questEmbed], components: [row] });
          const collectorFilter = (i) => i.user.id === interaction.user.id;
          try {
            while (true) {
              var confirmation = await message.awaitMessageComponent({
                time: config.discord.buttonTimeout * 1000,
                filter: collectorFilter,
              });
              if (confirmation.customId === 'leftButtonQuests') {
                num = num - 1;
                if (num <= 0) num = filteredQuests.length - 1;
                currentQuest = filteredQuests[num];

                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `Quest Filters:\nDungeon Filter: ${
                      dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSpecial Filter: ${
                      specialFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                      completedFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSort: ${sort}`
                  )
                  .setFields(
                    {
                      name: 'Name',
                      value: currentQuest.name,
                      inline: true,
                    },
                    {
                      name: 'Xp',
                      value: currentQuest.xp,
                      inline: true,
                    },
                    {
                      name: 'Emeralds',
                      value: currentQuest.emeralds,
                      inline: true,
                    },
                    {
                      name: 'Combat Min Lvl',
                      value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Mining Min Lvl',
                      value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Wood Cutting Min Lvl',
                      value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Farming Min Lvl',
                      value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Fishing Min Lvl',
                      value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Type',
                      value: currentQuest.type,
                      inline: true,
                    },
                    {
                      name: 'Length',
                      value: currentQuest.length,
                      inline: true,
                    },
                    {
                      name: 'Main Province',
                      value: currentQuest.mainProvince,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await confirmation.update({ embeds: [questEmbed], components: [row] });
              } else if (confirmation.customId === 'rightButtonQuests') {
                num = num + 1;
                if (num <= 0) num = filteredQuests.length - 1;
                currentQuest = filteredQuests[num];

                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `Quest Filters:\nDungeon Filter: ${
                      dungeonFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSpecial Filter: ${
                      specialFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nNormal Filter: ${normalFilter}\nEvent Filter: ${eventFilter}\nCompleted Filter: ${
                      completedFilter ? config.other.emojis.yes : config.other.emojis.no
                    }\nSort: ${sort}`
                  )
                  .setFields(
                    {
                      name: 'Name',
                      value: currentQuest.name,
                      inline: true,
                    },
                    {
                      name: 'Xp',
                      value: currentQuest.xp,
                      inline: true,
                    },
                    {
                      name: 'Emeralds',
                      value: currentQuest.emeralds,
                      inline: true,
                    },
                    {
                      name: 'Combat Min Lvl',
                      value: currentQuest.combatMinLvl === null ? 'None' : currentQuest.combatMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Mining Min Lvl',
                      value: currentQuest.miningMinLvl === null ? 'None' : currentQuest.miningMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Wood Cutting Min Lvl',
                      value: currentQuest.woodCuttingMinLvl === null ? 'None' : currentQuest.woodCuttingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Farming Min Lvl',
                      value: currentQuest.farmingMinLvl === null ? 'None' : currentQuest.farmingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Fishing Min Lvl',
                      value: currentQuest.fishingMinLvl === null ? 'None' : currentQuest.fishingMinLvl,
                      inline: true,
                    },
                    {
                      name: 'Type',
                      value: currentQuest.type,
                      inline: true,
                    },
                    {
                      name: 'Length',
                      value: currentQuest.length,
                      inline: true,
                    },
                    {
                      name: 'Main Province',
                      value: currentQuest.mainProvince,
                      inline: true,
                    }
                  )
                  .setTimestamp()
                  .setFooter({
                    text: `by @kathund | ${config.discord.supportInvite} for support`,
                    iconURL: config.other.logo,
                  });
                await confirmation.update({ embeds: [questEmbed], components: [row] });
              }
            }
          } catch (error) {
            var errorIdButtons = generateID(config.other.errorIdLength);
            errorMessage(`Error ID: ${errorIdButtons}`);
            errorMessage(error);
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
        return await interaction.reply({ embeds: [errorEmbed], rows: [row] });
      } else {
        var errorId = generateID(config.other.errorIdLength);
        errorMessage(`Error Id - ${errorId}`);
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setTitle('An error occurred')
          .setDescription(
            `Use </report-bug:${
              config.discord.commands['report-bug']
            }> to report it\nError id - ${errorId}\nError Info - \`${cleanMessage(error)}\``
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
    }
  },
};
