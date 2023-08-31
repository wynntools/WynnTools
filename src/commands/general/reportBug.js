const {
  SlashCommandBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ButtonBuilder,
  EmbedBuilder,
  ModalBuilder,
  ButtonStyle,
  Events,
} = require('discord.js');
const { writeAt, toFixed, generateID } = require('../../functions/helper.js');
const { errorMessage } = require('../../functions/logger.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName('report-bug')
    .setDescription('Report a bug to the dev'),

  async execute(interaction) {
    try {
      const modal = new ModalBuilder().setCustomId('bugReport').setTitle('Bug Report');
      const title = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('')
        .setMaxLength(512)
        .setMinLength(10);
      const whatHappened = new TextInputBuilder()
        .setCustomId('whatHappened')
        .setLabel('What Happened?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setMinLength(20);
      const howDidThisHappen = new TextInputBuilder()
        .setCustomId('howDidThisHappen')
        .setLabel('How did this happen?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setMinLength(20);
      const whenDidThisHappen = new TextInputBuilder()
        .setCustomId('whenDidThisHappen')
        .setLabel('When did this happen?')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setMinLength(20);
      const stepsToReproduce = new TextInputBuilder()
        .setCustomId('stepsToReproduce')
        .setLabel('Steps To Reproduce')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1024)
        .setMinLength(20);
      const firstActionRow = new ActionRowBuilder().addComponents(title);
      const secondActionRow = new ActionRowBuilder().addComponents(whatHappened);
      const thirdActionRow = new ActionRowBuilder().addComponents(howDidThisHappen);
      const forthActionRow = new ActionRowBuilder().addComponents(whenDidThisHappen);
      const fifthActionRow = new ActionRowBuilder().addComponents(stepsToReproduce);
      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);
      await interaction.showModal(modal);
      interaction.client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isModalSubmit()) return;
        const title = interaction.fields.getTextInputValue('title');
        const whatHappened = interaction.fields.getTextInputValue('whatHappened');
        const howDidThisHappen = interaction.fields.getTextInputValue('howDidThisHappen');
        const whenDidThisHappen = interaction.fields.getTextInputValue('whenDidThisHappen');
        const stepsToReproduce = interaction.fields.getTextInputValue('stepsToReproduce');
        const embed = new EmbedBuilder()
          .setColor(config.discord.embeds.green)
          .setAuthor({ name: 'Bug Report Submitted' })
          .setDescription(`Your bug report has been successfully sent to the dev.`)
          .setFooter({ text: `by @kathund | ${config.discord.supportInvite} for support`, iconURL: config.other.logo });
        const bugReportEmbed = new EmbedBuilder()
          .setColor(config.discord.embeds.red)
          .setTitle(`BUG REPORT`)
          .setDescription(`Reported by ${interaction.user.id} | <@${interaction.user.id}>`)
          .addFields(
            { name: 'Title', value: `${title}`, inline: true },
            { name: 'What Happened', value: `${whatHappened}`, inline: true },
            { name: 'How Did This Happen', value: `${howDidThisHappen}`, inline: true },
            { name: 'When Did This Happen', value: `${whenDidThisHappen}`, inline: true },
            { name: 'Steps To Reproduce', value: `${stepsToReproduce}`, inline: true }
          )
          .setTimestamp();
        await writeAt('data/bugReports.json', interaction.user.id, {
          id: interaction.user.id,
          questions: {
            title: title,
            whatHappened: whatHappened,
            howDidThisHappen: howDidThisHappen,
            whenDidThisHappen: whenDidThisHappen,
            stepsToReproduce: stepsToReproduce,
          },
          status: { pending: true, fixed: false, lookedInto: false },
          reportedAt: toFixed(new Date().getTime() / 1000, 0),
          lastUpdatedAt: toFixed(new Date().getTime() / 1000, 0),
        });
        await interaction.client.users.send(config.discord.devId, {
          content: `<@${config.discord.devId}>`,
          embeds: [bugReportEmbed],
        });
        await interaction.reply({ embeds: [embed], ephemeral: true });
      });
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
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
        .setFooter({ text: `by @kathund | ${config.discord.supportInvite} for support`, iconURL: config.other.logo });
      const supportDisc = new ButtonBuilder()
        .setLabel('Support Discord')
        .setURL(config.discord.supportInvite)
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(supportDisc);
      await interaction.reply({ embeds: [errorEmbed], rows: [row] });
    }
  },
};
