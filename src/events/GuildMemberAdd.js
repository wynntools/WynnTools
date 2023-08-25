const { generateMemberJoin } = require('./src/functions/generateImage.js');
const config = require('./config.json');

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
      console.log(error);
    }
  },
};
