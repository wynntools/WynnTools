const { cacheMessage } = require('../logger.js');
const config = require('../../config.json');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const discordCache = new nodeCache();
const discordChannelsCache = new nodeCache();

async function getUsername(id) {
  if (discordCache.has(id)) {
    cacheMessage('DiscordAPI', 'Cache hit');
    return discordCache.get(id).username;
  }
  const data = await fetch(`https://discord.com/api/v9/users/${id}`, {
    headers: {
      Authorization: `Bot ${config.discord.token}`,
    },
  }).then((res) => res.json());
  discordCache.set(id, data);
  return data.username;
}

async function getDisplayName(id) {
  if (discordCache.has(id)) {
    cacheMessage('DiscordAPI', 'Cache hit');
    return discordCache.get(id).global_name;
  }
  const data = await fetch(`https://discord.com/api/v9/users/${id}`, {
    headers: {
      Authorization: `Bot ${config.discord.token}`,
    },
  }).then((res) => res.json());
  discordCache.set(id, data);
  return data.global_name;
}

async function getGuild(id) {
  if (discordCache.has(id)) {
    cacheMessage('DiscordAPI', 'Cache hit');
    return discordCache.get(id).guild;
  }
  const res = await fetch(`https://discord.com/api/v9/guilds/${id}`, {
    headers: {
      Authorization: `Bot ${config.discord.token}`,
    },
  });
  const data = await res.json();
  discordCache.set(id, data);
  return data.guild;
}

async function getGuildChannel(guildId, channelId) {
  if (discordChannelsCache.has(channelId)) {
    cacheMessage('DiscordAPI', 'Cache hit');
    return discordChannelsCache.get(channelId);
  }
  const res = await fetch(`https://discord.com/api/v9/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${config.discord.token}`,
    },
  });
  const data = await res.json();
  data.find((item) => item.id === channelId);
  discordChannelsCache.set(channelId, data);
  return data.guild;
}

async function clearDiscordCache() {
  cacheMessage('DiscordAPI', 'Cleared');
  discordCache.flushAll();
}

module.exports = { getUsername, getDisplayName, getGuild, clearDiscordCache };
