const { discordMessage, scriptMessage, warnMessage, errorMessage } = require('./src/functions/logger.js');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { deployCommands, deployDevCommands } = require('./deploy-commands.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { toFixed, generateID } = require('./src/functions/helper.js');
const config = require('./config.json');
const path = require('path');
const fs = require('fs');

async function start() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
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

  deployCommands();
  deployDevCommands();

  await delay(3000);

  client.once(Events.ClientReady, async () => {
    global.uptime = toFixed(new Date().getTime() / 1000, 0);
    global.client = client;
    discordMessage(`Client Logged in as ${client.user.tag}`);
    const scriptFiles = fs.readdirSync('./src/scripts').filter((file) => file.endsWith('.js'));
    scriptMessage(`Found ${scriptFiles.length} scripts and running them all`);
    var skipped = 0;
    for (const file of scriptFiles) {
      try {
        if (file.toLowerCase().includes('disabled')) {
          skipped++;
          scriptMessage(`Skipped ${file} script`);
          continue;
        }
        scriptMessage(`Started ${file} script`);
        require(`./src/scripts/${file}`);
        await delay(300);
      } catch (error) {
        var errorId = generateID(config.other.errorIdLength);
        errorMessage(`Error ID: ${errorId}`);
        errorMessage(error);
      }
    }
    scriptMessage(`Started ${scriptFiles.length - skipped} script(s) and skipped ${skipped} script(s)`);
  });

  const eventsPath = path.join(__dirname, 'src/events');
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    client.on(Events[event.name], (...args) => event.execute(...args));
  }

  client.login(config.discord.token);
}

start();
