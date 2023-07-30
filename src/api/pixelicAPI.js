const { validateUUID, getUUID } = require('./mojangAPI.js');
const { cacheMessage } = require('../logger.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const pixelicCache = new nodeCache();

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

async function clearPixelicCache() {
  cacheMessage('PixelicAPI', 'Cleared');
  pixelicCache.flushAll();
}

module.exports = { register, clearPixelicCache };
