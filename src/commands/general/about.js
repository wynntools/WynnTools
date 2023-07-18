const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { blacklistCheck } = require('../../helperFunctions.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder().setName('about').setDescription('Shows info about the bot').setDMPermission(false),
  async execute(interaction) {
    try {
      var blacklistTest = await blacklistCheck(interaction.user.id);
      if (blacklistTest) {
        await interaction.reply({ content: 'You are blacklisted' });
        return;
      }

      var packageJson = require('../../../package.json');
      const commands = [];
      // get all file names in the commands folder then push the name into commands array
      fs.readdirSync(path.resolve(__dirname, '../general')).forEach((file) => {
        // filter out files that are not .js files
        if (!file.endsWith('.js')) return;
        commands.push(file);
      });
         

      const support = new ButtonBuilder()
        .setLabel('support')
        .setURL('https://discord.gg/kathund')
        .setStyle(ButtonStyle.Link);

      const invite = new ButtonBuilder()
        .setLabel('invite')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=1127383186683465758&permissions=8&scope=bot')
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(support, invite);

      await interaction.reply({
        embeds: [
          {
            title: 'About',
            description: 'A bot that does stuff with the wynncraft api',
            fields: [
              {
                name: '<:invis:1064700091778220043>',
                value: `<:Dev:1130772126769631272> Developer - \`@kathund\`\n<:commands:1130772895891738706> Commands - ${commands.length}\n<:bullet:1064700156789927936> Version ${packageJson.version}`,
                inline: true,
              },
            ],
          },
        ],
        components: [row],
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: `${error}` });
    }
  },
};
