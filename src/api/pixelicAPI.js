const { validateUUID, getUUID } = require('./mojangAPI.js');
const config = require('..././../config.json');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const pixelicCache = new nodeCache();

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
    if (!res.status === 201) {
      var data = await res.json();
      return {
        status: res.status,
        error: data.cause,
      };
    } else {
      return {
        status: res.status,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function clearCache() {
  pixelicCache.flushAll();
}

module.exports = { register, clearCache };
