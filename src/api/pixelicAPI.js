const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { validateUUID, getUUID } = require('./mojangAPI.js');
const { cacheMessage } = require('../logger.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const pixelicCache = new nodeCache({ stdTTL: 180 });
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));
async function register(uuid) {
  try {
    uuid = uuid.replace(/-/g, '');
    var check = await validateUUID(uuid);
    if (!check) {
      await getUUID(uuid);
      check = await validateUUID(uuid);
    }
    console.log(uuid);
    if (!check) return { status: 400, error: 'Invalid UUID' };
    var res = await fetch(`https://api.pixelic.de/wynncraft/v1/player/${uuid}/register`, {
      method: 'POST',
      headers: { 'X-API-Key': config.api.pixelicAPIKey },
    });
    console.log(res.status);
    if (res.status === 201) {
      return { status: res.status, success: true, info: 'Registered' };
    } else {
      var data = await res.json();
      return { status: res.status, error: data.cause };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function registerGuild(guild) {
  try {
    console.log(guild.members.OWNER);
    var members = Object.values(guild.members).flatMap((rankData) =>
      Object.values(rankData).map((data) => data.uuid)
    );
    console.log(members);

    const chunkSize = 20;
    let registeredCount = 0;

    for (let i = 0; i < members.length; i += chunkSize) {
      const chunk = members.slice(i, i + chunkSize);

      for (const uuid of chunk) {
        console.log(uuid);
        const registered = await register(uuid);
        if (registered.success) {
          registeredCount++;
        }
      }

      if (i + chunkSize < members.length) {
        await delay(1500);
      }
    }

    console.log(`Total users registered: ${registeredCount}`);
    return registeredCount;
  } catch (error) {
    console.log(error);
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
      if (!res.status === 200) {
        return { status: res.status, error: data.cause };
      } else {
        console.log(data);
        var response = { status: res.status, success: true };
        pixelicCache.set('serverList', response);
        return response;
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function getServerHistory(id, timeframe) {
  try {
    timeframe = timeframe.toLowerCase();
    var options = ['hour', 'day', 'week', 'month', 'year', 'alltime'];
    if (!options.includes(timeframe)) return { status: 400, error: 'Invalid timeframe' };
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
        return { status: res.status, success: false, error: data.cause };
      }
    }
  } catch (error) {
    console.log(error);
    return error;
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
      }
    }
  } catch (error) {
    console.log(error);
    return error;
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
        return { status: 400, error: 'Invalid Server' };
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
    console.log(error);
    return error;
  }
}
async function getHistoryStats(uuid, timeframe) {
  try {
    var check = await validateUUID(uuid);
    if (!check) {
      await getUUID(uuid);
      check = await validateUUID(uuid);
    }
    timeframe = timeframe.toLowerCase();
    var options = ['daily', 'weekly', 'monthly'];
    if (!options.includes(timeframe)) return { status: 400, error: 'Invalid timeframe' };
    var res = await fetch(
      `https://api.pixelic.de/wynncraft/v1/player/${uuid}/history/${timeframe}`,
      { headers: { 'X-API-Key': config.api.pixelicAPIKey } }
    );
    var data = await res.json();
    if (!res.status === 200) {
      return { status: res.status, error: data.cause };
    } else {
      return { status: res.status, success: true, data: data.data };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function clearPixelicCache() {
  cacheMessage('PixelicAPI', 'Cleared');
  pixelicCache.flushAll();
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
