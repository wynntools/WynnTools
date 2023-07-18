const { discordMessage, warnMessage } = require('./src/logger.js');
const { REST, Routes } = require('discord.js');
const config = require('./config.json');
const path = require('path');
const fs = require('fs');

function deployCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, 'src/commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    if (folder == 'dev') continue;
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        warnMessage(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  const rest = new REST().setToken(config.discord.token);

  (async () => {
    try {
      discordMessage(`Started refreshing ${commands.length} application (/) commands.`);

      const data = await rest.put(Routes.applicationCommands(config.discord.clientId), { body: commands });

      discordMessage(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  })();
}

function deployDevCommands() {
  const commands = [];
  const foldersPath = path.join(__dirname, 'src/commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    if (folder != 'dev') continue;
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        warnMessage(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  const rest = new REST().setToken(config.discord.token);

  (async () => {
    try {
      discordMessage(`Started refreshing ${commands.length} application (/) commands to the dev server.`);

      const data = await rest.put(Routes.applicationGuildCommands(config.discord.clientId, config.discord.devServer), {
        body: commands,
      });

      discordMessage(`Successfully reloaded ${data.length} application (/) commands to the dev server.`);
    } catch (error) {
      console.error(error);
    }
  })();
}
module.exports = { deployCommands, deployDevCommands };
