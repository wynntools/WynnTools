const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { generateID, cleanMessage } = require('../../functions/helper.js');
const { generateGuild } = require('../../functions/generateImage.js');
const { errorMessage } = require('../../functions/logger.js');
const { registerGuild } = require('../../api/pixelicAPI.js');
const { getGuild } = require('../../api/wynnCraftAPI.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Displays the statistics of the specified guild.')
    .setDMPermission(false)
    .addStringOption((option) => option.setName('name').setDescription("The guild's name.").setRequired(true)),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      var name = interaction.options.getString('name');
      var guild = await getGuild(name);
      if (guild === 'Invalid Guild Name') {
        throw new Error('Invalid Guild Name');
      } else {
        await registerGuild(guild);
        await interaction.editReply({ files: [await generateGuild(guild)] });
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red.hex)
          .setTitle('An error occurred')
          .setDescription(`Error Info - \`${cleanMessage(error)}\``)
          .setFooter({
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
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
            text: `by @kathund. | ${config.discord.supportInvite} for support`,
            iconURL: config.other.logo,
          });
        const supportDisc = new ButtonBuilder()
          .setLabel('Support Discord')
          .setURL(config.discord.supportInvite)
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(supportDisc);
        await interaction.editReply({ embeds: [errorEmbed], rows: [row] });
      }
    }
  },
};
