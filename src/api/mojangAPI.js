const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { generateID, cleanMessage } = require('../functions/helper.js');
const config = require('../../config.json');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((error) => errorMessage(error));

const mojangCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

async function getUUID(username) {
  try {
    if (mojangCache.has(username.toLowerCase())) {
      cacheMessage('MojangAPI', 'Cache hit');
      return mojangCache.get(username.toLowerCase()).id;
    } else {
      const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
      if (res.status != 200) {
        throw new Error({ status: res.status, error: 'Invalid Username' });
      } else {
        var data = await res.json();
        mojangCache.set(data.id, data);
        mojangCache.set(username.toLowerCase(), data);
        return data.id;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getUsername(uuid) {
  try {
    if (mojangCache.has(uuid)) {
      cacheMessage('MojangAPI', 'Cache hit');
      return mojangCache.get(uuid).name;
    } else {
      const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
      if (res.status != 200) {
        throw new Error({ status: res.status, error: 'Invalid UUID' });
      } else {
        var data = await res.json();
        mojangCache.set(uuid, data);
        mojangCache.set(data.name.toLowerCase(), data);
        return data.name;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearMojangCache() {
  try {
    cacheMessage('MojangAPI', 'Cleared');
    mojangCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

module.exports = { getUUID, getUsername, clearMojangCache };
