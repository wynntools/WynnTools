const { generateMemberJoin } = require('../functions/generateImage.js');
const { errorMessage } = require('../functions/logger.js');
const { generateID } = require('../functions/helper.js');
const config = require('../../config.json');

module.exports = {
  name: 'GuildMemberAdd',
  async execute(member) {
    try {
      if (member.guild.id != config.discord.devServer) return;
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
