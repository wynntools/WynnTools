const { eventMessage, errorMessage } = require('../functions/logger.js');
const { generateMemberJoin } = require('../functions/generateImage.js');
const { generateID } = require('../functions/helper.js');
const config = require('../../config.json');
const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      if (config.other.devMode) return;
      if (member.guild.id != config.discord.devServer) return;
      eventMessage(
        `GuildMemberAdd Event triggered for ${member.user.username}${
          member.user.discriminator == '0' ? '' : `#${member.user.discriminator}`
        }`
      );
      var welcomeChannel = await client.channels.fetch(config.discord.channels.welcome);
      await welcomeChannel.send({
        content: `Welcome <@${member.user.id}> to WynnTools Support`,
        files: [await generateMemberJoin(member)],
      });
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error ID: ${errorId}`);
      errorMessage(error);
    }
  },
};
