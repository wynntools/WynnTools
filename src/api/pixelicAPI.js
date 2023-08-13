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
    var check = await validateUUID(uuid);
    if (!check) {
      await getUUID(uuid).then((res) => (uuid = res));
      check = await validateUUID(uuid);
    }
    if (!check) return { status: 400, error: 'Invalid UUID' };
    var res = await fetch(`https://api.pixelic.de/wynncraft/v1/player/${uuid}/register`, {
      method: 'POST',
      headers: {
        'X-API-Key': config.api.pixelicAPIKey,
      },
    });
    console.log(res.status);
    if (res.status === 201) {
      return {
        status: res.status,
        success: true,
        info: 'Registered',
      };
    } else {
      var data = await res.json();
      return {
        status: res.status,
        error: data.cause,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getServerList() {
  try {
    if (pixelicCache.has('serverList')) {
      cacheMessage('PixelicAPI', 'hit');
      return pixelicCache.get('serverList');
    } else {
      var res = await fetch(`https://api.pixelic.de/wynncraft/v1/server/list`, {
        headers: {
          'X-API-Key': config.api.pixelicAPIKey,
        },
      });
      var data = await res.json();
      if (!res.status === 200) {
        return {
          status: res.status,
          error: data.cause,
        };
      } else {
        console.log(data);
        var response = {
          status: res.status,
          success: true,
        };
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
        headers: {
          'X-API-Key': config.api.pixelicAPIKey,
        },
      });
      var data = await res.json();
      if (res.status === 200) {
        var response = {
          status: res.status,
          success: true,
          data: data.data,
        };
        pixelicCache.set(`${id}-${timeframe}`, response);
        return response;
      } else {
        return {
          status: res.status,
          success: false,
          error: data.cause,
        };
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
        headers: {
          'X-API-Key': config.api.pixelicAPIKey,
        },
      });
      var data = await res.json();
      if (res.status === 200) {
        var response = {
          status: res.status,
          success: true,
          servers: data.servers,
        };
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
      return {
        name: server.name,
        onlineSince: server.onlineSince,
      };
    } else {
      return {
        name: serverName,
        offlineSince: null,
      };
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
  getServerList,
  getServerHistory,
  getServerUptimes,
  getServerUptime,
  clearPixelicCache,
};
