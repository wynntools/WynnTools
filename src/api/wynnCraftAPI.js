const { validateUUID, formatUUID, generateID, cleanMessage } = require('../functions/helper.js');
const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { getUUID } = require('./mojangAPI.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((error) => errorMessage(error));

const wynncraftPlayerCache = new nodeCache({ stdTTL: config.other.cacheTimeout });
const wynncraftGuildCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

function formatData(data) {
  try {
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
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getStats(uuid) {
  try {
    var check = validateUUID(uuid);
    if (!check) {
      await getUUID(uuid);
      check = validateUUID(uuid);
    }
    if (!check) {
      uuid = formatUUID(uuid);
      check = validateUUID(uuid);
    }
    if (!check) throw new Error('Invalid UUID');
    if (!uuid.includes('-')) uuid = formatUUID(uuid);
    if (wynncraftPlayerCache.has(uuid)) {
      cacheMessage('WynnCraft API Player', 'hit');
      return wynncraftPlayerCache.get(uuid);
    } else {
      var res = await fetch(`https://api.wynncraft.com/v2/player/${uuid}/stats`);
      if (res.status != 200) {
        throw new Error('Player has no stats');
      } else {
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
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getProfiles(uuid) {
  try {
    var stats = await getStats(uuid);
    if (stats === 'Player has no stats') throw new Error('Player has no stats');
    return Object.keys(stats.data.characters).map((key) => {
      const { type, level } = stats.data.characters[key];
      return { key, type, level };
    });
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getGuild(name) {
  try {
    var fixedNamed = encodeURIComponent(name);
    if (wynncraftGuildCache.has(fixedNamed)) {
      cacheMessage('WynnCraft API Guild', 'hit');
      return wynncraftGuildCache.get(fixedNamed);
    } else {
      var res = await fetch(`https://web-api.wynncraft.com/api/v3/guild/${fixedNamed}`);
      if (res.status != 200) {
        throw new Error('Invalid Guild Name');
      } else {
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
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServers() {
  try {
    var res = await fetch(`https://api.wynncraft.com/public_api.php?action=onlinePlayers`);
    var data = await res.json();
    if (res.status != 200) {
      throw new Error('Error');
    } else {
      var response = { status: res.status, request: data.request, data: formatData(data) };
      return response;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServer(id) {
  try {
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
        throw new Error('Invalid Server');
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
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearWynnCraftCache() {
  try {
    cacheMessage('WynnCraft API Player', 'Cleared');
    wynncraftPlayerCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearWynnCraftGuildCache() {
  try {
    cacheMessage('WynnCraft API Guild', 'Cleared');
    wynncraftGuildCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

module.exports = {
  getStats,
  getProfiles,
  getGuild,
  getServers,
  getServer,
  clearWynnCraftCache,
  clearWynnCraftGuildCache,
};
