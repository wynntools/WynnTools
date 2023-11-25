const {
  convertToUnixTimestamp,
  fixGuildMemberData,
  getOnlineMembers,
  cleanMessage,
  formatUUID,
  generateID,
} = require('../functions/helper.js');
const { cacheMessage, errorMessage } = require('../functions/logger.js');
const { getUUID } = require('./mojangAPI.js');
const config = require('../../config.json');
const validate = require('uuid-validate');
const nodeCache = require('node-cache');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch((error) => errorMessage(error));

const wynncraftPlayerCache = new nodeCache({ stdTTL: config.other.cacheTimeout });
const wynncraftGuildCache = new nodeCache({ stdTTL: config.other.cacheTimeout });

function formatData(data) {
  try {
    const formattedData = {};
    for (const key in data) {
      if (key !== 'request' && Object.prototype.hasOwnProperty.call(data, key)) {
        formattedData[key] = { status: 'online', players: data[key], count: data[key].length };
      }
    }
    const sortedWcCounts = Object.fromEntries(
      Object.entries(formattedData).sort((a, b) => {
        const serverNumA = parseInt(a[0].replace('WC', ''));
        const serverNumB = parseInt(b[0].replace('WC', ''));
        return serverNumA - serverNumB;
      })
    );
    return sortedWcCounts;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getStats(uuid) {
  try {
    var check = validate(uuid);
    if (!check) {
      await getUUID(uuid);
      check = validate(uuid);
    }
    if (!check) {
      uuid = formatUUID(uuid);
      check = validate(uuid);
    }
    if (!check) throw new Error('Invalid UUID');
    if (!uuid.includes('-')) uuid = formatUUID(uuid);
    if (wynncraftPlayerCache.has(uuid)) {
      cacheMessage('WynnCraft API Player', 'hit');
      return wynncraftPlayerCache.get(uuid);
    } else {
      var res = await fetch(`https://api.wynncraft.com/v3/player/${uuid}?fullResult=True`);
      if (res.status != 200) {
        throw new Error('Player has no stats');
      } else {
        const dateStr = res.headers.get('date');
        const timestamp = dateStr ? convertToUnixTimestamp(dateStr) : Math.floor(Date.now() / 1000);
        var data = await res.json();
        var response = {
          status: res.status,
          timestamp: timestamp,
          username: data.username,
          uuid: data.uuid,
          public: data.publicProfile,
          online: data.online,
          server: data.server,
          rank: {
            rank: data.rank,
            badge: data.rankBadge,
            colors: data.legacyRankColour,
            shorten: data.shortenedRank,
            support: data.supportRank,
          },
          playtime: data.playtime,
          guild: data.guild,
          firstJoin: convertToUnixTimestamp(data.firstJoin),
          lastJoin: convertToUnixTimestamp(data.lastJoin),
          global: data.globalData,
          forums: data.forumLink,
          ranking: data.ranking,
          characters: data.characters,
        };
        wynncraftPlayerCache.set(uuid, response);
        return response;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}
async function getProfiles(uuid) {
  try {
    var stats = await getStats(uuid);
    if (stats === 'Player has no stats') throw new Error('Player has no stats');
    return Object.keys(stats.characters).map((key) => {
      const { type, totalLevel, nickname } = stats.characters[key];
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      return { key, type, formattedType, nickname, totalLevel };
    });
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getGuild(name) {
  try {
    var fixedNamed = encodeURIComponent(name);
    if (wynncraftGuildCache.has(fixedNamed)) {
      cacheMessage('WynnCraft API Guild', 'hit');
      return wynncraftGuildCache.get(fixedNamed);
    } else {
      var res = await fetch(`https://api.wynncraft.com/v3/guild/${fixedNamed}`);
      if (res.status != 200) {
        throw new Error('Invalid Guild Name');
      } else {
        var data = await res.json();
        var memberList = fixGuildMemberData({
          owner: data.members.owner,
          chief: data.members.chief,
          strategist: data.members.strategist,
          captain: data.members.captain,
          recruiter: data.members.recruiter,
          recruit: data.members.recruit,
        });
        var response = {
          status: res.status,
          timestamp: Date.now(),
          name: data.name,
          fixedNamed: fixedNamed,
          prefix: data.prefix,
          level: data.level,
          xp: data.xpPercent,
          territories: data.territories,
          wars: data.wars,
          created: data.created,
          members: {
            list: memberList,
            total: data.members.total,
            online: getOnlineMembers(memberList),
          },
          banner: data.banner,
        };
        wynncraftGuildCache.set(fixedNamed, response);
        return response;
      }
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServers() {
  try {
    var res = await fetch(`https://api.wynncraft.com/public_api.php?/public_api.php?action=onlinePlayers`);
    var data = await res.json();
    if (res.status != 200) {
      throw new Error('Error');
    } else {
      var response = { status: res.status, request: data.request, data: formatData(data) };
      return response;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

async function getServer(id) {
  try {
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
        throw new Error('Invalid Server');
      }
    }
    var servers = await getServers();
    if (!servers.data[server]) {
      return { id: id, server: server, status: 'offline', players: [], count: 0 };
    }
    return {
      id: id,
      server: server,
      status: 'online',
      players: servers.data[server].players,
      count: servers.data[server].count,
    };
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearWynnCraftCache() {
  try {
    cacheMessage('WynnCraft API Player', 'Cleared');
    wynncraftPlayerCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

function clearWynnCraftGuildCache() {
  try {
    cacheMessage('WynnCraft API Guild', 'Cleared');
    wynncraftGuildCache.flushAll();
    return 'Cleared';
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error ID: ${errorId}`);
    errorMessage(error);
    return cleanMessage(error);
  }
}

module.exports = {
  getStats,
  getProfiles,
  getGuild,
  getServers,
  getServer,
  clearWynnCraftCache,
  clearWynnCraftGuildCache,
};
