const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { blacklistCheck, generateID } = require('../../helperFunctions.js');
const { generateGuild } = require('../../functions/generateImage.js');
const { getGuild } = require('../../api/wynnCraftAPI.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Displays the statistics of the specified guild.')
    .setDMPermission(false)
    .addStringOption((option) => option.setName('name').setDescription("The guild's name.").setRequired(true)),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        const blacklisted = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setDescription('You are blacklisted')
          .setFooter({
            text: `by @kathund | ${config.discord.supportInvite} for support`,
            iconURL: 'https://i.imgur.com/uUuZx2E.png',
          });
        await interaction.reply({ embeds: [blacklisted], ephemeral: true });
        return;
      }
      var name = interaction.options.getString('name');

      var guild = await getGuild(name);
      if (guild.status != 200) {
        await interaction.reply({ content: guild.error });
      } else {
        await interaction.reply({ files: [await generateGuild(guild)] });
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
          }> to report it\nError id - ${errorId}\nError Info - \`${error.toString().replaceAll('Error: ', '')}\``
        )
        .setFooter({
          text: `by @kathund | ${config.discord.supportInvite} for support`,
          iconURL: 'https://i.imgur.com/uUuZx2E.png',
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
