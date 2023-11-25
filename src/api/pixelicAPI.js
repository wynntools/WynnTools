const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { generateID, cleanMessage } = require('../functions/helper.js');
const { getUUID } = require('./mojangAPI.js');
const config = require('../../config.json');
const validate = require('uuid-validate');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch((error) => errorMessage(error));

const pixelicCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

async function register(uuid) {
  try {
    uuid = uuid.replace(/-/g, '');
    var check = validate(uuid);
    if (!check) {
      await getUUID(uuid);
      check = validate(uuid);
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
  getServerList,
  clearPixelicCache,
};
