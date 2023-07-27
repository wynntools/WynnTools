const config = require('../../config.json');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const discordCache = new nodeCache();

async function getUsername(id) {
  if (discordCache.has(id)) {
    console.log('Cache hit - discordAPI');
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
    console.log('Cache hit - discordAPI');
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

async function clearDiscordCache() {
  discordCache.flushAll();
}

module.exports = { getUsername, getDisplayName, clearDiscordCache };
