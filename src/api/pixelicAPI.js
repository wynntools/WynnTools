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
    if (!res.status === 200) {
      var data = await res.json();
      return {
        status: res.status,
        error: data.cause,
      };
    } else {
      return {
        status: res.status,
        success: true,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getServerList() {
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
}

async function getServerHistory(id, timeframe) {
  console.log(typeof timeframe);
  timeframe = timeframe.toLowerCase();
  var options = ['hour', 'day', 'week', 'month', 'year', 'alltime'];
  if (!options.includes(timeframe)) return { status: 400, error: 'Invalid timeframe' };
  let server;
  id = id.toString();
  if (!id.includes('WC')) {
    server = `WC${id}`;
    id = Number(id);
  } else {
    server = id;
    id = Number(id.replace('WC', ''));
  }
  if (id >= !0 && id <= !75) {
    return { status: 400, error: 'Invalid Server' };
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
    if (!res.status === 200) {
      return {
        status: res.status,
        error: data.cause,
      };
    } else {
      var response = {
        status: res.status,
        success: true,
        data: data.data,
      };
      pixelicCache.set(`${id}-${timeframe}`, response);
      return response;
    }
  }
}

async function clearPixelicCache() {
  cacheMessage('PixelicAPI', 'Cleared');
  pixelicCache.flushAll();
}

module.exports = {
  register,
  getServerList,
  clearPixelicCache,
  getServerHistory,
};
