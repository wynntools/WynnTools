const { cacheMessage } = require('../logger.js');
const nodeCache = require('node-cache');
const mojangCache = new nodeCache();
const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));
async function validateUUID(uuid) {
  uuid = uuid.replace(/-/g, '');
  var regex = /^[A-F\d]{8}[A-F\d]{4}4[A-F\d]{3}[89AB][A-F\d]{3}[A-F\d]{12}$/i;
  return regex.test(uuid);
}
async function getUUID(username) {
  if (mojangCache.has(username.toLowerCase())) {
    cacheMessage('MojangAPI', 'Cache hit');
    return mojangCache.get(username.toLowerCase()).id;
  } else {
    const data = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`).then(
      (res) => res.json()
    );
    if (data.id == undefined) return 'Invalid Username';
    else if (data.name == undefined) return 'Invalid Username';
    mojangCache.set(data.id, data);
    mojangCache.set(username.toLowerCase(), data);
    return data.id;
  }
}
async function getUsername(uuid) {
  if (mojangCache.has(uuid)) {
    cacheMessage('MojangAPI', 'Cache hit');
    return mojangCache.get(uuid).name;
  } else {
    const data = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    ).then((res) => res.json());
    if (data.id == undefined) return 'Invalid UUID';
    else if (data.name == undefined) return 'Invalid UUID';
    mojangCache.set(uuid, data);
    mojangCache.set(data.name.toLowerCase(), data);
    return data.name;
  }
}
async function clearMojangCache() {
  cacheMessage('MojangAPI', 'Cleared');
  mojangCache.flushAll();
}
module.exports = { validateUUID, getUUID, getUsername, clearMojangCache };
