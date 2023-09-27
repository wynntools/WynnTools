const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { addNotation, generateID, cleanMessage } = require('../../functions/helper.js');
const { getStats, getHighestProfile } = require('../../api/wynnCraftAPI.js');
const { errorMessage } = require('../../functions/logger.js');
const { getUUID } = require('../../api/mojangAPI.js');
const config = require('../../../config.json');
const fs = require('fs');

const quests = JSON.parse(fs.readFileSync('data/quests.json'));

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
        .addStringOption((option) =>
          option.setName('username').setDescription('The username to check').setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName('dungeon').setDescription('Hide Dungeon Quests').setRequired(false)
        )
        .addBooleanOption((option) => option.setName('event').setDescription('Hide Event Quests').setRequired(false))
        .addBooleanOption((option) => option.setName('normal').setDescription('Hide Normal Quests').setRequired(false))
        .addBooleanOption((option) =>
          option.setName('special').setDescription('Hide Special Quests').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('Search for a quest')
        .addStringOption((option) =>
          option.setName('query').setDescription('The query to search for').setRequired(true).setAutocomplete(true)
        )
        .addStringOption((option) =>
          option.setName('username').setDescription('The username to check').setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('to')
        .setDescription('Shows the best quests to get to a certain level')
        .addStringOption((option) =>
          option.setName('username').setDescription('The username to check').setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName('level')
            .setDescription('The level to get to')
            .setRequired(false)
            .setMaxValue(106)
            .setMinValue(1)
        )
        .addBooleanOption((option) =>
          option.setName('dungeon').setDescription('Hide Dungeon Quests').setRequired(false)
        )
        .addBooleanOption((option) => option.setName('event').setDescription('Hide Event Quests').setRequired(false))
        .addBooleanOption((option) => option.setName('normal').setDescription('Hide Normal Quests').setRequired(false))
        .addBooleanOption((option) =>
          option.setName('special').setDescription('Hide Special Quests').setRequired(false)
        )
    ),

  async autoComplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const input = focusedOption.value;
    let choices = [];
    if (interaction.options._subcommand === 'search' && focusedOption.name === 'query') {
      choices = quests
        .filter((quest) => quest.name.toLowerCase().startsWith(input.toLowerCase()))
        .map((quest) => quest.name);
    }
    const displayedChoices = choices.slice(0, 25);
    await interaction.respond(displayedChoices.map((choice) => ({ name: choice, value: choice })));
  },
  async execute(interaction) {
    try {
      const subcommand = await interaction.options.getSubcommand();
      if (subcommand === 'list') {
        let levelReqs = [];
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
        const dungeonFilter = interaction.options.getBoolean('dungeon') || false;
        const specialFilter = interaction.options.getBoolean('special') || false;
        const normalFilter = interaction.options.getBoolean('normal') || false;
        const eventFilter = interaction.options.getBoolean('event') || false;
        const username = interaction.options.getString('username') || null;
        let filteredQuests = sortedQuests;
        var filters = [];
        if (dungeonFilter) {
          filters.push('Dungeon');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Dungeon');
        }
        if (specialFilter) {
          filters.push('Special');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Special');
        }
        if (normalFilter) {
          filters.push('Normal');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Normal');
        }
        if (eventFilter) {
          filters.push('Event');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Event');
        }
        if (filters.length > 3) throw new Error('NO_ERROR_ID_Too many filters. Please only select 3 or less filters');
        let num = 0;
        let currentQuest = filteredQuests[num];
        let filtersString = '';
        if (filters.length === 0) {
          filtersString = 'None';
        } else {
          filtersString = filters.join(', ');
        }
        if (username) {
          const uuid = await getUUID(username);
          const stats = await getStats(uuid);
          var currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];
          const completedQuests = currentProfileStats.quests.list;
          filteredQuests.forEach((quest) => {
            if (completedQuests.includes(quest.name)) {
              quest.completed = true;
            } else {
              quest.completed = false;
            }
          });
          levelReqs = [];
          if (currentQuest.combatMinLvl !== null) {
            levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
          }
          if (currentQuest.miningMinLvl !== null) {
            levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
          }
          if (currentQuest.woodCuttingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
          }
          if (currentQuest.farmingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
          }
          if (currentQuest.fishingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
          }
          const questEmbed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
            .setDescription(
              `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
                currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
              }\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
            )
            .addFields(
              {
                name: 'General',
                value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                  'oneLetters',
                  currentQuest.xp
                )}\n\` • \` **Emeralds:** ${addNotation('oneLetters', currentQuest.emeralds)}\n\` • \` **Length:** ${
                  currentQuest.length
                }`,
                inline: true,
              },
              {
                name: 'Level Reqs',
                value: levelReqs.join('\n'),
                inline: true,
              },
              {
                name: 'Other',
                value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                inline: false,
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
                levelReqs = [];
                if (currentQuest.combatMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
                }
                if (currentQuest.miningMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
                }
                if (currentQuest.woodCuttingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
                }
                if (currentQuest.farmingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
                }
                if (currentQuest.fishingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
                }
                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
                      currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
                    }\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
                  )
                  .addFields(
                    {
                      name: 'General',
                      value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                        'oneLetters',
                        currentQuest.xp
                      )}\n\` • \` **Emeralds:** ${addNotation(
                        'oneLetters',
                        currentQuest.emeralds
                      )}\n\` • \` **Length:** ${currentQuest.length}`,
                      inline: true,
                    },
                    {
                      name: 'Level Reqs',
                      value: levelReqs.join('\n'),
                      inline: true,
                    },
                    {
                      name: 'Other',
                      value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                      inline: false,
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
                if (num >= filteredQuests.length) num = 0;
                currentQuest = filteredQuests[num];

                levelReqs = [];
                if (currentQuest.combatMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
                }
                if (currentQuest.miningMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
                }
                if (currentQuest.woodCuttingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
                }
                if (currentQuest.farmingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
                }
                if (currentQuest.fishingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
                }
                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
                      currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
                    }\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
                  )
                  .addFields(
                    {
                      name: 'General',
                      value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                        'oneLetters',
                        currentQuest.xp
                      )}\n\` • \` **Emeralds:** ${addNotation(
                        'oneLetters',
                        currentQuest.emeralds
                      )}\n\` • \` **Length:** ${currentQuest.length}`,
                      inline: true,
                    },
                    {
                      name: 'Level Reqs',
                      value: levelReqs.join('\n'),
                      inline: true,
                    },
                    {
                      name: 'Other',
                      value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                      inline: false,
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
            await interaction.editReply({ components: [] });
            errorMessage(`Error ID: ${errorIdButtonsComplete}`);
            errorMessage(error);
          }
        } else {
          levelReqs = [];
          if (currentQuest.combatMinLvl !== null) {
            levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
          }
          if (currentQuest.miningMinLvl !== null) {
            levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
          }
          if (currentQuest.woodCuttingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
          }
          if (currentQuest.farmingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
          }
          if (currentQuest.fishingMinLvl !== null) {
            levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
          }
          const questEmbed = new EmbedBuilder()
            .setColor(config.other.colors.green.hex)
            .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
            .setDescription(
              `\` • \` **Quest Filters:** ${filtersString}\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
            )
            .addFields(
              {
                name: 'General',
                value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                  'oneLetters',
                  currentQuest.xp
                )}\n\` • \` **Emeralds:** ${addNotation('oneLetters', currentQuest.emeralds)}\n\` • \` **Length:** ${
                  currentQuest.length
                }`,
                inline: true,
              },
              {
                name: 'Level Reqs',
                value: levelReqs.join('\n'),
                inline: true,
              },
              {
                name: 'Other',
                value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                inline: false,
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

                levelReqs = [];
                if (currentQuest.combatMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
                }
                if (currentQuest.miningMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
                }
                if (currentQuest.woodCuttingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
                }
                if (currentQuest.farmingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
                }
                if (currentQuest.fishingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
                }
                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `\` • \` **Quest Filters:** ${filtersString}\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
                  )
                  .addFields(
                    {
                      name: 'General',
                      value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                        'oneLetters',
                        currentQuest.xp
                      )}\n\` • \` **Emeralds:** ${addNotation(
                        'oneLetters',
                        currentQuest.emeralds
                      )}\n\` • \` **Length:** ${currentQuest.length}`,
                      inline: true,
                    },
                    {
                      name: 'Level Reqs',
                      value: levelReqs.join('\n'),
                      inline: true,
                    },
                    {
                      name: 'Other',
                      value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                      inline: false,
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
                if (num >= filteredQuests.length) num = 0;
                currentQuest = filteredQuests[num];

                levelReqs = [];
                if (currentQuest.combatMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
                }
                if (currentQuest.miningMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
                }
                if (currentQuest.woodCuttingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
                }
                if (currentQuest.farmingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
                }
                if (currentQuest.fishingMinLvl !== null) {
                  levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
                }
                const questEmbed = new EmbedBuilder()
                  .setColor(config.other.colors.green.hex)
                  .setTitle(`Quests - ${num + 1}/${sortedQuests.length}`)
                  .setDescription(
                    `\` • \` **Quest Filters:** ${filtersString}\n${sort !== 'name' ? `\` • \` **Sort:** ${sort}` : ''}`
                  )
                  .addFields(
                    {
                      name: 'General',
                      value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                        'oneLetters',
                        currentQuest.xp
                      )}\n\` • \` **Emeralds:** ${addNotation(
                        'oneLetters',
                        currentQuest.emeralds
                      )}\n\` • \` **Length:** ${currentQuest.length}`,
                      inline: true,
                    },
                    {
                      name: 'Level Reqs',
                      value: levelReqs.join('\n'),
                      inline: true,
                    },
                    {
                      name: 'Other',
                      value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                      inline: false,
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
            await interaction.editReply({ components: [] });
            errorMessage(`Error ID: ${errorIdButtons}`);
            errorMessage(error);
          }
        }
      } else if (subcommand === 'search') {
        var query = interaction.options.getString('query') || null;
        if (query == null) {
          throw new Error('NO_ERROR_ID_You need to provide a query');
        }
        const username = interaction.options.getString('username') || null;
        const currentQuest = quests.find((quest) => quest.name.toLowerCase() === query.toLowerCase());
        if (currentQuest == null) {
          throw new Error('NO_ERROR_ID_That quest does not exist');
        }

        var levelReqs = [];
        if (currentQuest.combatMinLvl !== null) {
          levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
        }
        if (currentQuest.miningMinLvl !== null) {
          levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
        }
        if (currentQuest.woodCuttingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
        }
        if (currentQuest.farmingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
        }
        if (currentQuest.fishingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
        }
        var questEmbed = {
          color: 0x00a176,
          title: currentQuest.name,
          fields: [
            {
              name: 'General',
              value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                'oneLetters',
                currentQuest.xp
              )}\n\` • \` **Emeralds:** ${addNotation('oneLetters', currentQuest.emeralds)}\n\` • \` **Length:** ${
                currentQuest.length
              }`,
              inline: true,
            },
            {
              name: 'Level Reqs',
              value: levelReqs.join('\n'),
              inline: true,
            },
            {
              name: 'Other',
              value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            icon_url: config.other.logo,
          },
        };

        if (username) {
          const uuid = await getUUID(username);
          const stats = await getStats(uuid);
          const currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];
          const completedQuests = currentProfileStats.quests.list;
          if (completedQuests.includes(currentQuest.name)) {
            currentQuest.completed = true;
          } else {
            currentQuest.completed = false;
          }
          questEmbed.description = `\` • \` **Completed:** ${
            currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
          }`;
        }

        await interaction.reply({ embeds: [questEmbed] });
      } else if (subcommand === 'to') {
        const username = interaction.options.getString('username') || null;
        if (username == null) {
          throw new Error('NO_ERROR_ID_You need to provide a username');
        }
        const uuid = await getUUID(username);
        const stats = await getStats(uuid);
        const filters = [];
        const currentProfileStats = stats.data.characters[await getHighestProfile(stats.data.characters)];
        const level = interaction.options.getInteger('level') || currentProfileStats.professions.combat.level + 1;
        const dungeonFilter = interaction.options.getBoolean('dungeon') || false;
        const specialFilter = interaction.options.getBoolean('special') || false;
        const normalFilter = interaction.options.getBoolean('normal') || false;
        const eventFilter = interaction.options.getBoolean('event') || false;
        var sortedQuests = quests.sort((a, b) => b.xp - a.xp);
        const completedQuests = currentProfileStats.quests.list;
        sortedQuests.forEach((quest) => {
          if (completedQuests.includes(quest.name)) {
            quest.completed = true;
          } else {
            quest.completed = false;
          }
        });
        let filteredQuests = sortedQuests
          .filter((quest) => quest.combatMinLvl <= currentProfileStats.professions.combat.level)
          .filter((quest) => quest.miningMinLvl <= currentProfileStats.professions.mining.level)
          .filter((quest) => quest.woodCuttingMinLvl <= currentProfileStats.professions.woodcutting.level)
          .filter((quest) => quest.farmingMinLvl <= currentProfileStats.professions.farming.level)
          .filter((quest) => quest.fishingMinLvl <= currentProfileStats.professions.fishing.level)
          .filter((quest) => quest.completed === false);
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
        if (filteredQuests.length === 0) {
          throw new Error('NO_ERROR_ID_There are no quests that you can do to get to that level');
        }
        if (dungeonFilter) {
          filters.push('Dungeon');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Dungeon');
        }
        if (specialFilter) {
          filters.push('Special');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Special');
        }
        if (normalFilter) {
          filters.push('Normal');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Normal');
        }
        if (eventFilter) {
          filters.push('Event');
          filteredQuests = sortedQuests.filter((quest) => quest.type !== 'Event');
        }

        let filtersString = '';
        if (filters.length === 0) {
          filtersString = 'None';
        } else {
          filtersString = filters.join(', ');
        }

        if (filteredQuests.length === 0) {
          throw new Error(
            'NO_ERROR_ID_There are no quests that you can do to get to that level with the filters you have selected'
          );
        }

        let num = 0;
        let currentQuest = filteredQuests[num];

        let levelReqs = [];
        if (currentQuest.combatMinLvl !== null) {
          levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
        }
        if (currentQuest.miningMinLvl !== null) {
          levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
        }
        if (currentQuest.woodCuttingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
        }
        if (currentQuest.farmingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
        }
        if (currentQuest.fishingMinLvl !== null) {
          levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
        }
        const responseEmbed = new EmbedBuilder()
          .setColor(config.other.colors.green.hex)
          .setTitle(`Best Quests to get to level ${level} - ${num + 1}/${filteredQuests.length}`)
          .setDescription(
            `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
              currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
            }`
          )
          .addFields(
            {
              name: 'General',
              value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                'oneLetters',
                currentQuest.xp
              )}\n\` • \` **Emeralds:** ${addNotation('oneLetters', currentQuest.emeralds)}\n\` • \` **Length:** ${
                currentQuest.length
              }`,
              inline: true,
            },
            {
              name: 'Level Reqs',
              value: levelReqs.join('\n'),
              inline: true,
            },
            {
              name: 'Other',
              value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
              inline: false,
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

        const message = await interaction.reply({ embeds: [responseEmbed], components: [row] });
        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
          while (true) {
            var confirmationQuestsTo = await message.awaitMessageComponent({
              time: config.discord.buttonTimeout * 1000,
              filter: collectorFilter,
            });

            if (confirmationQuestsTo.customId === 'leftButtonQuests') {
              num = num - 1;
              if (num <= 0) num = filteredQuests.length - 1;
              currentQuest = filteredQuests[num];

              levelReqs = [];
              if (currentQuest.combatMinLvl !== null) {
                levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
              }
              if (currentQuest.miningMinLvl !== null) {
                levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
              }
              if (currentQuest.woodCuttingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
              }
              if (currentQuest.farmingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
              }
              if (currentQuest.fishingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
              }

              const questEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green.hex)
                .setTitle(`Best Quests to get to level ${level} - ${num + 1}/${filteredQuests.length}`)
                .setDescription(
                  `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
                    currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
                  }`
                )
                .addFields(
                  {
                    name: 'General',
                    value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                      'oneLetters',
                      currentQuest.xp
                    )}\n\` • \` **Emeralds:** ${addNotation(
                      'oneLetters',
                      currentQuest.emeralds
                    )}\n\` • \` **Length:** ${currentQuest.length}`,
                    inline: true,
                  },
                  {
                    name: 'Level Reqs',
                    value: levelReqs.join('\n'),
                    inline: true,
                  },
                  {
                    name: 'Other',
                    value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                    inline: false,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });

              await confirmationQuestsTo.update({ embeds: [questEmbed], components: [row] });
            } else if (confirmationQuestsTo.customId === 'rightButtonQuests') {
              num = num + 1;
              if (num >= filteredQuests.length) num = 0;
              currentQuest = filteredQuests[num];

              levelReqs = [];
              if (currentQuest.combatMinLvl !== null) {
                levelReqs.push(`\` • \`   **Combat:** ${currentQuest.combatMinLvl}`);
              }
              if (currentQuest.miningMinLvl !== null) {
                levelReqs.push(`\` • \`   **Mining:** ${currentQuest.miningMinLvl}`);
              }
              if (currentQuest.woodCuttingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Wood Cutting:** ${currentQuest.woodCuttingMinLvl}`);
              }
              if (currentQuest.farmingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Farming:** ${currentQuest.farmingMinLvl}`);
              }
              if (currentQuest.fishingMinLvl !== null) {
                levelReqs.push(`\` • \`   **Fishing:** ${currentQuest.fishingMinLvl}`);
              }

              const questEmbed = new EmbedBuilder()
                .setColor(config.other.colors.green.hex)
                .setTitle(`Best Quests to get to level ${level} - ${num + 1}/${filteredQuests.length}`)
                .setDescription(
                  `\` • \` **Quest Filters:** ${filtersString}\n\` • \` **Completed:** ${
                    currentQuest.completed ? config.other.emojis.yes : config.other.emojis.no
                  }`
                )
                .addFields(
                  {
                    name: 'General',
                    value: `\` • \` **Name:** ${currentQuest.name}\n\` • \` **Xp:** ${addNotation(
                      'oneLetters',
                      currentQuest.xp
                    )}\n\` • \` **Emeralds:** ${addNotation(
                      'oneLetters',
                      currentQuest.emeralds
                    )}\n\` • \` **Length:** ${currentQuest.length}`,
                    inline: true,
                  },
                  {
                    name: 'Level Reqs',
                    value: levelReqs.join('\n'),
                    inline: true,
                  },
                  {
                    name: 'Other',
                    value: `\` • \` **Type:** ${currentQuest.type}\n\` • \` **Main Province:** ${currentQuest.mainProvince}\n\` • \` **Wiki Url:** [${currentQuest.name} Wiki Page](${currentQuest.wikiUrl})`,
                    inline: false,
                  }
                )
                .setTimestamp()
                .setFooter({
                  text: `by @kathund | ${config.discord.supportInvite} for support`,
                  iconURL: config.other.logo,
                });

              await confirmationQuestsTo.update({ embeds: [questEmbed], components: [row] });
            }
          }
        } catch (error) {
          var errorIdBQuestsToButtons = generateID(config.other.errorIdLength);
          errorMessage(`Error ID: ${errorIdBQuestsToButtons}`);
          errorMessage(error);
        }
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red.hex)
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
          .setColor(config.other.colors.red.hex)
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
