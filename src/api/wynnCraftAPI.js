const { validateUUID, getUUID } = require('./mojangAPI.js');
const { formatUUID } = require('../functions/helper.js');
const { cacheMessage } = require('../logger.js');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const wynncraftPlayerCache = new nodeCache({ stdTTL: 180 });
const wynncraftGuildCache = new nodeCache({ stdTTL: 180 });

function formatData(data) {
  const formattedData = {};
  for (const key in data) {
    if (key !== 'request' && Object.prototype.hasOwnProperty.call(data, key)) {
      formattedData[key] = { status: 'online', players: data[key], count: data[key].length };
    }
  }
  const sortedWcCounts = Object.fromEntries(
    Object.entries(formattedData).sort((a, b) => {
      const serverNumA = parseInt(a[0].replace('WC', ''));
      const serverNumB = parseInt(b[0].replace('WC', ''));
      return serverNumA - serverNumB;
    })
  );
  return sortedWcCounts;
}

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
      cacheMessage('WynnCraft API Player', 'hit');
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
    cacheMessage('WynnCraft API Guild', 'hit');
    return wynncraftGuildCache.get(fixedNamed);
  } else {
    var res = await fetch(`https://web-api.wynncraft.com/api/v3/guild/${fixedNamed}`);
    if (res.status != 200) {
      return { status: res.status, error: 'Invalid Guild Name' };
    }
    var data = await res.json();
    var response = {
      status: res.status,
      name: data.name,
      fixedNamed: fixedNamed,
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

async function getServers() {
  var res = await fetch(`https://api.wynncraft.com/public_api.php?action=onlinePlayers`);
  var data = await res.json();
  if (res.status != 200) {
    return { status: res.status, error: 'Error' };
  }
  var response = { status: res.status, request: data.request, data: formatData(data) };
  return response;
}

async function getServer(id) {
  let server;
  id = id.toString().toLowerCase();
  if (id.includes('yt')) {
    server = `WCYT`;
    id = 'YT';
  } else {
    if (!id.includes('wc')) {
      server = `WC${id}`;
      id = Number(id);
    } else {
      server = id;
      id = Number(id.replace('wc', ''));
    }
    if (id >= !0 && id <= !75) {
      return { status: 400, error: 'Invalid Server' };
    }
  }
  var servers = await getServers();
  if (!servers.data[server]) {
    return { id: id, server: server, status: 'offline', players: [], count: 0 };
  }
  return {
    id: id,
    server: server,
    status: 'online',
    players: servers.data[server].players,
    count: servers.data[server].count,
  };
}

async function clearWynnCraftCache() {
  cacheMessage('WynnCraft API Player', 'Cleared');
  wynncraftPlayerCache.flushAll();
}

async function clearWynnCraftGuildCache() {
  cacheMessage('WynnCraft API Guild', 'Cleared');
  wynncraftGuildCache.flushAll();
}

module.exports = {
  getStats,
  getHighestProfile,
  getProfiles,
  getGuild,
  getServers,
  getServer,
  clearWynnCraftCache,
  clearWynnCraftGuildCache,
};
