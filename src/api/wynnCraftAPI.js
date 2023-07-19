const { validateUUID, getUUID } = require('./mojangAPI.js');
const { formatUUID } = require('../helperFunctions.js');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const wynncraftPlayerCache = new nodeCache({ stdTTL: 300 });
const wynncraftGuildCache = new nodeCache({ stdTTL: 300 });

async function getStats(uuid) {
  try {
    var check = await validateUUID(uuid);
    if (!check) {
      await getUUID(uuid).then((res) => (uuid = res));
      check = await validateUUID(uuid);
    }
    if (!check) return { status: 400, error: 'Invalid UUID' };
    if (!uuid.includes('-')) uuid = formatUUID(uuid);
    if (wynncraftPlayerCache.has(uuid)) {
      console.log('Cache hit - wynnCraftCache');
      return wynncraftPlayerCache.get(uuid);
    } else {
      var res = await fetch(`https://api.wynncraft.com/v2/player/${uuid}/stats`);
      var data = await res.json();
      var response = {
        status: res.status,
        timestamp: data.timestamp,
        username: data.data[0].username,
        uuid: data.data[0].uuid,
        rank: data.data[0].rank,
        data: {
          meta: data.data[0].meta,
          characters: data.data[0].characters,
          guild: data.data[0].guild,
          global: data.data[0].global,
          ranking: data.data[0].ranking,
        },
      };
      wynncraftPlayerCache.set(uuid, response);
      return response;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getHighestProfile(characters) {
  let highestLevel = -Infinity;
  let selectedId = null;

  for (const id in characters) {
    const currentObject = characters[id];
    if (currentObject.level > highestLevel) {
      highestLevel = currentObject.level;
      selectedId = id;
    }
  }
  return selectedId;
}

async function getProfiles(uuid) {
  var stats = await getStats(uuid);
  return Object.keys(stats.data.characters).map((key) => {
    const { type, level } = stats.data.characters[key];
    return { key, type, level };
  });
}

async function getGuild(name) {
  var fixedNamed = encodeURIComponent(name);
  if (wynncraftGuildCache.has(fixedNamed)) {
    console.log('Cache hit - wynnCraftCache');
    return wynncraftGuildCache.get(fixedNamed);
  } else {
    var res = await fetch(`https://web-api.wynncraft.com/api/v3/guild/${fixedNamed}`);
    if (res.stats != 200) {
      return { status: res.status, error: 'Invalid Guild Name' };
    }
    var data = await res.json();
    var response = {
      status: res.status,
      name: data.name,
      timestamp: Date.now(),
      prefix: data.prefix,
      members: data.members,
      created: data.created,
      xp: data.xp,
      level: data.level,
      banner: data.banner,
      onlineMembers: data.onlineMembers,
      offlineMembers: data.totalMembers - data.onlineMembers,
      totalMembers: data.totalMembers,
      territories: data.territories,
    };
    wynncraftGuildCache.set(fixedNamed, response);
    return response;
  }
}

async function clearWynnCraftCache() {
  wynncraftPlayerCache.flushAll();
}

async function clearWynnCraftGuildCache() {
  wynncraftGuildCache.flushAll();
}

module.exports = { getStats, getHighestProfile, getProfiles, getGuild, clearWynnCraftCache, clearWynnCraftGuildCache };
