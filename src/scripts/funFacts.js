const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { getUsername } = require('../api/discordAPI.js');
const { writeAt } = require('../helperFunctions.js');
const { scriptMessage } = require('../logger.js');
const config = require('../../config.json');
const cron = require('node-cron');
const fs = require('fs');

cron.schedule('03 21 * * *', async function () {
  var startTime = Math.floor(Date.now() / 1000);
  function checkFunFact(fact) {
    try {
      if (fact.lastSent + 1209600 < startTime) {
        return true; // Older than 14 days
      } else {
        return false; // Younger than 14 days
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  const blacklist = new Set();

  function getRandomFact() {
    try {
      const funFactList = JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'));
      const validFacts = Object.keys(funFactList).filter((factId) => !blacklist.has(factId));
      if (validFacts.length === 0) {
        console.log('No more valid fun facts available.');
        return null;
      }
      const randomFactId = validFacts[Math.floor(Math.random() * validFacts.length)];
      const randomFact = funFactList[randomFactId];
      return randomFact;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  try {
    scriptMessage('Sending fun facts');

    let funFact;
    let numCheckedFacts = 0;
    const totalFacts = Object.keys(JSON.parse(fs.readFileSync('data/funFacts/list.json', 'utf8'))).length;

    do {
      funFact = getRandomFact();
      if (funFact && checkFunFact(funFact)) {
        /* empty */
      } else if (funFact) {
        blacklist.add(funFact.id);
      }
      numCheckedFacts++;
    } while (funFact && !checkFunFact(funFact) && numCheckedFacts < totalFacts);

    if (!funFact || (funFact && !checkFunFact(funFact))) {
      console.log('No valid fun facts found.');
    }

    const funFactConfigs = JSON.parse(fs.readFileSync('data/funFacts/config.json', 'utf8'));
    const funFactConfigsObject = Object.keys(funFactConfigs);

    const setup = new ButtonBuilder()
      .setCustomId('setupGuideFunFacts')
      .setLabel('How to setup')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(setup);

    var requestedByString = '';
    if (funFact.requestedBy && funFact.hidden != false) {
      requestedByString = `Requested by ${await getUsername(funFact.requestedBy)} | `;
    }

    const funFactEmbed = new EmbedBuilder()
      .setColor(config.discord.embeds.green)
      .setDescription(
        `**Today's Fun fact is** \n${funFact.fact}\n\n${requestedByString}Next fun fact <t:${startTime + 86400}:R>`
      )
      .setFooter({
        text: `by @kathund | https://discord.gg/ub63JjGGSN for support`,
        iconURL: 'https://i.imgur.com/uUuZx2E.png',
      });
    let currentConfig;
    for (let i = 0; i < funFactConfigsObject.length; i++) {
      currentConfig = funFactConfigs[funFactConfigsObject[i]];
      if (currentConfig.disabled) return;
      const serverId = currentConfig.serverId;
      const channelId = currentConfig.channelId;
      const guild = client.guilds.cache.get(serverId);
      const channel = guild.channels.cache.get(channelId);
      if (currentConfig.deleteMsgs) await channel.bulkDelete(100);
      if (currentConfig.role === null) {
        await channel.send({ embeds: [funFactEmbed], components: [row] });
      } else {
        if (currentConfig.ghostPing) {
          await channel.sent({ content: `<@&${currentConfig.roleId}>` });
          await channel.bulkDelete(1);
          await delay(300);
          await channel.send({ embeds: [funFactEmbed], components: [row] });
        } else {
          await channel.send({ embeds: [funFactEmbed], components: [row], content: `<@&${currentConfig.roleId}>` });
        }
      }
      await delay(300);
    }

    await writeAt('data/funFacts/list.json', funFact.id, {
      requestedBy: funFact.requestedBy,
      fact: funFact.fact,
      hidden: funFact.hidden,
      id: funFact.id,
      lastSent: startTime,
    });
    await writeAt('data/funFacts/list.json', 'next', startTime + 86400);
  } catch (error) {
    console.error(error);
  }
});
