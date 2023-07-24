const { clearWynnCraftCache, clearWynnCraftGuildCache } = require('../../api/wynnCraftAPI.js');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { clearDiscordCache } = require('../../api/discordAPI.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const { clearMojangCache } = require('../../api/mojangAPI.js');
const config = require('../../../config.json');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-cache')
    .setDescription('Clear Cache (Dev Only)')
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName('cache')
        .setDescription('The Cache you want to clear')
        .setRequired(false)
        .addChoices(
          { name: 'Mojang', value: 'mojang' },
          { name: 'WynnCraft', value: 'wynncraft' },
          { name: 'Wynncraft Guilds', value: 'wynncraftGuild' },
          { name: 'Discord', value: 'discord' },
          { name: 'All', value: 'all' }
        )
    ),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
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
      } else if (cacheCategory == 'all') {
        await clearMojangCache();
        await clearDiscordCache();
        await clearWynnCraftCache();
        await clearWynnCraftGuildCache();
        await interaction.reply({ content: 'Cleared All Caches' });
      } else {
        throw new Error('uhhh something went wrong');
      }
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
