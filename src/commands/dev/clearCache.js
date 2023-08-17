const {
  clearGenerateStatsCache,
  clearGenerateProfileImageCache,
  clearGenerateGuildCache,
  clearGenerateServerCache,
  clearGenerateServerGraphCache,
} = require('../../functions/generateImage.js');
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { clearWynnCraftCache, clearWynnCraftGuildCache } = require('../../api/wynnCraftAPI.js');
const { clearDiscordCache } = require('../../api/discordAPI.js');
const { clearPixelicCache } = require('../../api/pixelicAPI.js');
const { clearMojangCache } = require('../../api/mojangAPI.js');
const { generateID } = require('../../helperFunctions.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-cache')
    .setDescription('Clear Cache (Dev Only)')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('cache')
        .setDescription('The Cache you want to clear')
        .setRequired(true)
        .addChoices(
          { name: 'Mojang', value: 'mojang' },
          { name: 'WynnCraft', value: 'wynncraft' },
          { name: 'Wynncraft Guilds', value: 'wynncraftGuild' },
          { name: 'Discord', value: 'discord' },
          { name: 'Pixelic', value: 'pixelic' },
          { name: 'Generate Stats', value: 'clearGenerateStatsCache' },
          { name: 'Generate Profile Image', value: 'clearGenerateProfileImageCache' },
          { name: 'Generate Guild', value: 'clearGenerateGuildCache' },
          { name: 'Generate Server', value: 'clearGenerateServerCache' },
          { name: 'Generate Server Graph', value: 'clearGenerateServerGraphCache' },
          { name: 'All', value: 'all' }
        )
    ),
  async execute(interaction) {
    try {
      if (!interaction.user.id == config.discord.devId) {
        await interaction.reply({ content: 'No Perms?' });
        return;
      }
      const cacheCategory = interaction.options.getString('cache');
      if (cacheCategory == 'mojang') {
        await clearMojangCache();
        await interaction.reply({ content: 'Cleared Mojang Cache' });
      } else if (cacheCategory == 'wynncraft') {
        await clearWynnCraftCache();
        await interaction.reply({ content: 'Cleared WynnCraft Cache' });
      } else if (cacheCategory == 'wynncraftGuild') {
        await clearWynnCraftGuildCache();
        await interaction.reply({ content: 'Cleared WynnCraft Guild Cache' });
      } else if (cacheCategory == 'discord') {
        await clearDiscordCache();
        await interaction.reply({ content: 'Cleared Discord Cache' });
      } else if (cacheCategory == 'pixelic') {
        await clearPixelicCache();
        await interaction.reply({ content: 'Cleared Pixelic Cache' });
      } else if (cacheCategory === 'clearGenerateStatsCache') {
        await clearGenerateStatsCache();
        await interaction.reply({ content: 'Cleared Generate Stats Cache' });
      } else if (cacheCategory === 'clearGenerateProfileImageCache') {
        await clearGenerateProfileImageCache();
        await interaction.reply({ content: 'Cleared Generate Profile Image Cache' });
      } else if (cacheCategory === 'clearGenerateGuildCache') {
        await clearGenerateGuildCache();
        await interaction.reply({ content: 'Cleared Generate Guild Cache' });
      } else if (cacheCategory === 'clearGenerateServerCache') {
        await clearGenerateServerCache();
        await interaction.reply({ content: 'Cleared Generate Server Cache' });
      } else if (cacheCategory === 'clearGenerateServerGraphCache') {
        await clearGenerateServerGraphCache();
        await interaction.reply({ content: 'Cleared Generate Server Graph Cache' });
      } else if (cacheCategory == 'all') {
        await clearMojangCache();
        await clearDiscordCache();
        await clearPixelicCache();
        await clearWynnCraftCache();
        await clearWynnCraftGuildCache();
        await clearGenerateStatsCache();
        await clearGenerateProfileImageCache();
        await clearGenerateGuildCache();
        await clearGenerateServerCache();
        await clearGenerateServerGraphCache();
        await interaction.reply({ content: 'Cleared All Caches' });
      } else {
        throw new Error('uhhh something went wrong');
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
