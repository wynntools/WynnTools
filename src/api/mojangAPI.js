const fetch = (...args) =>
  import('node-fetch')
    .then(({ default: fetch }) => fetch(...args))
    .catch((err) => console.log(err));

const nodeCache = require('node-cache');
const mojangCache = new nodeCache();

async function validateUUID(uuid) {
  var regex;
  if (uuid.includes('-')) {
    regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
    return regex.test(uuid);
  } else {
    regex = /^[A-F\d]{8}[A-F\d]{4}4[A-F\d]{3}[89AB][A-F\d]{3}[A-F\d]{12}$/i;
    return regex.test(uuid);
  }
}

async function getUUID(username) {
  if (mojangCache.has(username.toLowerCase())) {
    console.log('Cache hit - mojangAPI');
    return mojangCache.get(username.toLowerCase()).id;
  } else {
    const data = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`).then((res) => res.json());
    mojangCache.set(data.id, data);
    mojangCache.set(username.toLowerCase(), data);
    return data.id;
  }
}

async function getUsername(uuid) {
  if (mojangCache.has(uuid)) {
    console.log('Cache hit - mojangAPI');
    return mojangCache.get(uuid).name;
  } else {
    const data = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).then((res) =>
      res.json()
    );
    mojangCache.set(uuid, data);
    mojangCache.set(data.name.toLowerCase(), data);
    return data.name;
  }
}

async function clearMojangCache() {
  mojangCache.flushAll();
}

module.exports = { validateUUID, getUUID, getUsername, clearMojangCache };
