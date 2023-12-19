const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, Events } = require('discord.js');
const { eventMessage, errorMessage } = require('../functions/logger.js');
const { generateID, cleanMessage } = require('../functions/helper.js');
const config = require('../../config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      if (message.author.bot) return;
      if (config.other.devMode) return;
      if (message.channel.type == 'DM') return;
      if (!message.content.startsWith(`<@${message.client.user.id}>`)) return;
      eventMessage(
        `Message Event trigged by ${message.author.discriminator == '0' ? '' : `#${message.author.discriminator}`} (${
          message.author.id
        })`
      );
      const responseEmbed = new EmbedBuilder()
        .setTitle('WynnTools')
        .setColor(config.other.colors.aqua)
        .setDescription(
          `Hello! I am WynnTools, a bot made by <@${config.discord.devId}> to help with WynnCraft related things.\n\nI use the \`/\` Prefix to run my commands.\nSome commands that you can use to try out the bot are </stats:${config.discord.commands.stats}> (Udderly_cool For example)\n\nFor any questions related to the bot please join the support server using the button below`
        )
        .setTimestamp()
        .setFooter({
          text: `by @kathund.`,
          iconURL: config.other.logo,
        });
      const supportDisc = new ButtonBuilder()
        .setLabel('Support Discord')
        .setURL(config.discord.supportInvite)
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(supportDisc);
      if (message.replied || message.deferred) {
        await message.followUp({ content: 'Hello!', embeds: [responseEmbed], rows: [row] });
      } else {
        await message.reply({ content: 'Hello!', embeds: [responseEmbed], rows: [row] });
      }
    } catch (error) {
      if (String(error).includes('NO_ERROR_ID_')) {
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red)
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
        if (message.replied || message.deferred) {
          return await message.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
        } else {
          return await message.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
        }
      } else {
        var errorIdCheck = generateID(config.other.errorIdLength);
        errorMessage(`Error ID: ${errorIdCheck}`);
        errorMessage(error);
        const errorEmbed = new EmbedBuilder()
          .setColor(config.other.colors.red)
          .setTitle('An error occurred')
          .setDescription(
            `Use </report-bug:${
              config.discord.commands['report-bug']
            }> to report it\nError id - ${errorIdCheck}\nError Info - \`${cleanMessage(error)}\``
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
        if (message.replied || message.deferred) {
          await message.followUp({ embeds: [errorEmbed], rows: [row], ephemeral: true });
        } else {
          await message.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
        }
      }
    }
  },
};
