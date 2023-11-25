const { validateUUID, generateID, cleanMessage } = require('../functions/helper.js');
const { cacheMessage, errorMessage } = require('../functions/logger.js');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { getGuild } = require('./wynnCraftAPI.js');
const { getUUID } = require('./mojangAPI.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch((error) => errorMessage(error));

const pixelicCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

async function register(uuid) {
  try {
    uuid = uuid.replace(/-/g, '');
    var check = validateUUID(uuid);
    if (!check) {
      await getUUID(uuid);
      check = validateUUID(uuid);
    }
    if (!check) throw new Error('Invalid UUID');
    var res = await fetch(`https://api.pixelic.de/wynncraft/v1/player/${uuid}/register`, {
      method: 'POST',
      headers: { 'X-API-Key': config.api.pixelicAPIKey },
    });
    if (res.status === 201) {
      return { status: res.status, success: true, info: 'Registered' };
    } else {
      var data = await res.json();
      throw new Error({ status: res.status, error: data.cause });
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function registerGuild(guild) {
  try {
    if (!guild.members) guild = await getGuild(guild);
    if (guild === 'Invalid Guild Name') throw new Error('Invalid Guild Name');
    Object.keys(guild.members).forEach(async (rank) => {
      Object.keys(guild.members[rank]).forEach(async (member) => {
        await register(member.uuid);
        await delay(1000);
      });
    });
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServerList() {
  try {
    if (pixelicCache.has('serverList')) {
      cacheMessage('PixelicAPI', 'hit');
      return pixelicCache.get('serverList');
    } else {
      var res = await fetch(`https://api.pixelic.de/wynncraft/v1/server/list`, {
        headers: { 'X-API-Key': config.api.pixelicAPIKey },
      });
      var data = await res.json();
      if (res.status === 200) {
        var response = { status: res.status, success: true };
        pixelicCache.set('serverList', response);
        return response;
      } else {
        throw new Error({ status: res.status, error: data.cause });
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServerHistory(id, timeframe) {
  try {
    timeframe = timeframe.toLowerCase();
    var options = ['hour', 'day', 'week', 'month', 'year', 'alltime'];
    if (!options.includes(timeframe)) throw new Error({ status: 400, error: 'Invalid timeframe' });
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
        throw new Error({ status: 400, error: 'Invalid Server' });
      }
    }
    if (pixelicCache.has(`${id}-${timeframe}`)) {
      cacheMessage('PixelicAPI', 'hit');
      return pixelicCache.get(`${id}-${timeframe}`);
    } else {
      var res = await fetch(`https://api.pixelic.de/wynncraft/v1/server/${server}/${timeframe}`, {
        headers: { 'X-API-Key': config.api.pixelicAPIKey },
      });
      var data = await res.json();
      if (res.status === 200) {
        var response = { status: res.status, success: true, data: data.data };
        pixelicCache.set(`${id}-${timeframe}`, response);
        return response;
      } else {
        throw new Error({ status: res.status, success: false, error: data.cause });
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServerUptimes() {
  try {
    if (pixelicCache.has('serverUptimes')) {
      cacheMessage('PixelicAPI', 'hit');
      return pixelicCache.get('serverUptimes');
    } else {
      var res = await fetch(`https://api.pixelic.de/wynncraft/v1/server/list/uptime`, {
        headers: { 'X-API-Key': config.api.pixelicAPIKey },
      });
      var data = await res.json();
      if (res.status === 200) {
        var response = { status: res.status, success: true, servers: data.servers };
        pixelicCache.set('serverUptimes', response);
        return response;
      } else {
        throw new Error({ status: res.status, success: false, error: data.cause });
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServerUptime(id) {
  try {
    let serverName;
    id = id.toString().toLowerCase();
    if (id.includes('yt')) {
      serverName = `YT`;
      id = 'YT';
    } else {
      if (!id.includes('wc')) {
        serverName = `WC${id}`;
        id = Number(id);
      } else {
        serverName = id.toUpperCase();
        id = Number(id.replace('wc', ''));
      }
      if (id >= !0 && id <= !75) {
        throw new Error({ status: 400, error: 'Invalid Server' });
      }
    }
    var servers = await getServerUptimes();
    var server = servers.servers.find((server) => server.name === serverName);
    if (server) {
      return { name: server.name, onlineSince: server.onlineSince };
    } else {
      return { name: serverName, offlineSince: null };
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getHistoryStats(uuid, timeframe) {
  try {
    var check = validateUUID(uuid);
    if (!check) {
      await getUUID(uuid);
      check = validateUUID(uuid);
    }
    timeframe = timeframe.toLowerCase();
    var options = ['daily', 'weekly', 'monthly'];
    if (!options.includes(timeframe)) throw new Error({ status: 400, error: 'Invalid timeframe' });
    var res = await fetch(`https://api.pixelic.de/wynncraft/v1/player/${uuid}/history/${timeframe}`, {
      headers: { 'X-API-Key': config.api.pixelicAPIKey },
    });
    var data = await res.json();
    if (res.status === 200) {
      return { status: res.status, success: true, data: data.data };
    } else {
      throw new Error({ status: res.status, error: data.cause });
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearPixelicCache() {
  try {
    cacheMessage('PixelicAPI', 'Cleared');
    pixelicCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

module.exports = {
  register,
  registerGuild,
  getServerList,
  getServerHistory,
  getServerUptimes,
  getServerUptime,
  getHistoryStats,
  clearPixelicCache,
};
