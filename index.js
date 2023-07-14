// eslint-disable-next-line
const { Client, Collection, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { discordMessage, commandMessage, scriptMessage, warnMessage } = require('./src/Logger.js');
const token = require('./config.json').discord.token;
const path = require('path');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      warnMessage(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once(Events.ClientReady, () => {
  discordMessage(`Client Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    try {
      if (interaction.user.discriminator == '0') {
        commandMessage(`${interaction.user.username} (${interaction.user.id}) ran command ${interaction.commandName}`);
      } else {
        commandMessage(
          `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) ran command ${interaction.commandName}`
        );
      }
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// Get all the files in the current directory
const commandFiles = fs.readdirSync('./src/scripts').filter((file) => file.endsWith('.js'));
scriptMessage(`Found ${commandFiles.length} scripts and running them all`);
// loop through the filtered files and require them so they run
for (const file of commandFiles) {
  try {
    // Console log the file name
    scriptMessage(`Started ${file} script`);
    require(`./src/scripts/${file}`);
  } catch (error) {
    console.log(error);
  }
}
scriptMessage(`Started all scripts`);

client.login(token);
