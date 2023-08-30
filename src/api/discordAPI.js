const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { generateID } = require('../functions/helper.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const discordCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

async function getUsername(id) {
  try {
    if (discordCache.has(id)) {
      cacheMessage('DiscordAPI', 'Cache hit');
      return discordCache.get(id).username;
    } else {
      const data = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: { Authorization: `Bot ${config.discord.token}` },
      }).then((res) => res.json());
      discordCache.set(id, data);
      return data.username;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    console.log(error);
    return error;
  }
}

async function getDisplayName(id) {
  try {
    if (discordCache.has(id)) {
      cacheMessage('DiscordAPI', 'Cache hit');
      return discordCache.get(id).global_name;
    } else {
      const data = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: { Authorization: `Bot ${config.discord.token}` },
      }).then((res) => res.json());
      discordCache.set(id, data);
      return data.global_name;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    console.log(error);
    return error;
  }
}

function clearDiscordCache() {
  try {
    cacheMessage('DiscordAPI', 'Cleared');
    discordCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    console.log(error);
    return error;
  }
}

module.exports = { getUsername, getDisplayName, clearDiscordCache };
