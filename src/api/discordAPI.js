const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { generateID, cleanMessage } = require('../functions/helper.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch((error) => errorMessage(error));

const discordCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

async function getDiscordUsername(id) {
  try {
    if (discordCache.has(id)) {
      cacheMessage('DiscordAPI', 'Cache hit');
      return discordCache.get(id).username;
    } else {
      const res = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: { Authorization: `Bot ${config.discord.token}` },
      });
      if (res.status != 200) {
        throw new Error({ status: res.status, error: 'Invalid ID' });
      } else {
        var data = await res.json();
        discordCache.set(id, data);
        return data.username;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getDisplayName(id) {
  try {
    if (discordCache.has(id)) {
      cacheMessage('DiscordAPI', 'Cache hit');
      return discordCache.get(id).global_name;
    } else {
      const res = await fetch(`https://discord.com/api/v9/users/${id}`, {
        headers: { Authorization: `Bot ${config.discord.token}` },
      });
      if (res.status != 200) {
        throw new Error({ status: res.status, error: 'Invalid ID' });
      } else {
        var data = await res.json();
        discordCache.set(id, data);
        return data.global_name;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
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
    errorMessage(error);
    return cleanMessage(error);
  }
}

module.exports = { getDiscordUsername, getDisplayName, clearDiscordCache };
