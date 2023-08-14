const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} = require('discord.js');
const { discordMessage, commandMessage, scriptMessage, warnMessage, errorMessage } = require('./src/logger.js');
const { writeAt, toFixed, generateID, blacklistCheck } = require('./src/helperFunctions.js');
const { deployCommands, deployDevCommands } = require('./deploy-commands.js');
const { generateMemberJoin } = require('./src/functions/generateImage.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
        console.log(error);
      }
    }
    scriptMessage(`Started ${scriptFiles.length - skipped} script(s) and skipped ${skipped} script(s)`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        // ! logging
        try {
          if (interaction.user.discriminator == '0') {
            commandMessage(
              `${interaction.user.username} (${interaction.user.id}) ran command ${interaction.commandName}`
            );
          } else {
            commandMessage(
              `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) ran command ${interaction.commandName}`
            );
          }
        } catch (error) {
          console.log(error);
        }

        // ! Command Tracking
        try {
          if (!config.discord.channels.noCommandTracking.includes(interaction.channel.id)) {
            var userData = JSON.parse(fs.readFileSync('data/userData.json'));
            let data;
            if (userData[interaction.user.id]) {
              data = {
                commandsRun: userData[interaction.user.id].commandsRun + 1,
                firstCommand: userData[interaction.user.id].firstCommand,
                lastUpdated: toFixed(new Date().getTime() / 1000, 0),
                commands: userData[interaction.user.id].commands,
              };
              const commands = data.commands;
              if (commands[interaction.commandName]) {
                commands[interaction.commandName]++;
              } else {
                commands[interaction.commandName] = 1;
              }
              await writeAt('data/userData.json', interaction.user.id, data);
            } else {
              data = {
                commandsRun: 1,
                firstCommand: toFixed(new Date().getTime() / 1000, 0),
                lastUpdated: toFixed(new Date().getTime() / 1000, 0),
                commands: { [interaction.commandName]: 1 },
              };
              await writeAt('data/userData.json', interaction.user.id, data);
            }
          }
        } catch (error) {
          console.log(error);
        }

        // ! blacklist check / command execution
        try {
          var blacklistTest = await blacklistCheck(interaction.user.id);
          if (blacklistTest) {
            const blacklisted = new EmbedBuilder()
              .setColor(config.discord.embeds.red)
              .setDescription('You are blacklisted')
              .setFooter({
                text: `by @kathund | ${config.discord.supportInvite} for support`,
                iconURL: 'https://i.imgur.com/uUuZx2E.png',
              });
            return await interaction.reply({ embeds: [blacklisted], ephemeral: true });
          }
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
          }
        }
      }

      if (interaction.isButton()) {
        try {
          // ? Setup Guide for Fun Facts
          if (interaction.customId.includes('setupGuideFunFacts')) {
            const setupGuideCommand = interaction.client.commands.get('fun-facts');

            if (setupGuideCommand === undefined) {
              throw new Error(
                'Setup guide command is missing. Please make a bug report or join the support server and make a ticket'
              );
            }

            await setupGuideCommand.execute(interaction);
          }
        } catch (error) {
          console.error(error);
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });

          var errorId = generateID(10);
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
            .setFooter({
              text: `by @kathund | ${config.discord.supportInvite} for support`,
              iconURL: 'https://i.imgur.com/uUuZx2E.png',
            });

          const supportDisc = new ButtonBuilder()
            .setLabel('Support Discord')
            .setURL(config.discord.supportInvite)
            .setStyle(ButtonStyle.Link);

          const row = new ActionRowBuilder().addComponents(supportDisc);

          await interaction.reply({ embeds: [errorEmbed], rows: [row], ephemeral: true });
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  client.on(Events.GuildMemberAdd, async (member) => {
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
  });

  client.login(config.discord.token);
}
start();
