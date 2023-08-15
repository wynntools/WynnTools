const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { generateGuild } = require('../../functions/generateImage.js');
const { registerGuild } = require('../../api/pixelicAPI.js');
const { generateID } = require('../../helperFunctions.js');
const { getGuild } = require('../../api/wynnCraftAPI.js');
const { errorMessage } = require('../../logger.js');
const config = require('../../../config.json');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Displays the statistics of the specified guild.')
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('name').setDescription("The guild's name.").setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      var name = interaction.options.getString('name');
      var guild = await getGuild(name);
      if (guild.status != 200) {
        await interaction.editReply({ content: guild.error });
      } else {
        await registerGuild(guild);
        await interaction.editReply({ files: [await generateGuild(guild)] });
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
      await interaction.editReply({ embeds: [errorEmbed], rows: [row] });
    }
  },
};
