const { discordMessage, warnMessage, errorMessage } = require('./src/functions/logger.js');
const { generateID } = require('./src/functions/helper.js');
const { REST, Routes } = require('discord.js');
const config = require('./config.json');
const path = require('path');
const fs = require('fs');

function deployCommands() {
  const commands = [];
  let skipped = 0;
  const foldersPath = path.join(__dirname, 'src/commands');
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    if (folder == 'dev') continue;
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      if (file.toLowerCase().includes('disabled')) {
        skipped++;
        continue;
      }
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
      discordMessage(
        `Started refreshing ${commands.length} application (/) commands and skipped over ${skipped} commands.`
      );
      const data = await rest.put(
        Routes.applicationCommands(Buffer.from(config.discord.token.split('.')[0], 'base64').toString('ascii')),
        {
          body: commands,
        }
      );
      discordMessage(
        `Successfully reloaded ${data.length} application (/) commands and skipped over ${skipped} commands.`
      );
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error ID: ${errorId}`);
      errorMessage(error);
    }
  })();
}

function deployDevCommands() {
  const commands = [];
  let skipped = 0;
  const foldersPath = path.join(__dirname, 'src/commands');
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    if (folder != 'dev') continue;
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      if (file.toLowerCase().includes('disabled')) {
        skipped++;
        continue;
      }
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
      discordMessage(
        `Started refreshing ${commands.length} application (/) commands to the dev server and skipped over ${skipped} commands.`
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(
          Buffer.from(config.discord.token.split('.')[0], 'base64').toString('ascii'),
          config.discord.devServer
        ),
        {
          body: commands,
        }
      );
      discordMessage(
        `Successfully reloaded ${data.length} application (/) commands to the dev server and skipped over ${skipped} commands.`
      );
    } catch (error) {
      var errorId = generateID(config.other.errorIdLength);
      errorMessage(`Error ID: ${errorId}`);
      errorMessage(error);
    }
  })();
}

module.exports = { deployCommands, deployDevCommands };
