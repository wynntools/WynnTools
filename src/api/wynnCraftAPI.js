const { validateUUID, getUUID } = require('./mojangAPI.js');
const { formatUUID, writeAt } = require('../helperFunctions.js');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const wynncraftCache = new nodeCache(); // Cached Keys will never get removed (should not be a problem as it takes very little memory and gets restarted often)

async function getStats(uuid) {
  try {
    var check = await validateUUID(uuid);
    if (!check) {
      await getUUID(uuid).then((res) => (uuid = res));
      check = await validateUUID(uuid);
    }
    if (!check) return { status: 400, error: 'Invalid UUID' };
    if (!uuid.includes('-')) uuid = formatUUID(uuid);
    if (wynncraftCache.has(uuid)) {
      console.log('Cache hit');
      await writeAt('data/cache.json', uuid, wynncraftCache.get(uuid));
      return wynncraftCache.get(uuid);
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
      wynncraftCache.set(uuid, response);
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

async function clearCache() {
  wynncraftCache.flushAll();
}

module.exports = { getStats, clearCache, getHighestProfile };
