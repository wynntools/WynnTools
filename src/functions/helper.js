const { errorMessage } = require('../functions/logger.js');
const config = require('../../config.json');
const getDirName = require('path').dirname;
const fsExtra = require('fs-extra');
const { set } = require('lodash');
const mkdirp = require('mkdirp');
const moment = require('moment');
const fs = require('fs');

function generateID(length) {
  try {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } catch (error) {
    errorMessage(error);
  }
}

function formatUUID(uuid) {
  try {
    if (uuid === undefined || uuid === null) return uuid;
    return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

async function writeAt(filePath, jsonPath, value) {
  try {
    mkdirp.sync(getDirName(filePath));
    const json = await fsExtra.readJson(filePath);
    set(json, jsonPath, value);
    return await fsExtra.writeJson(filePath, json);
  } catch (error) {
    errorMessage(error);
    const json_1 = {};
    set(json_1, jsonPath, value);
    return await fsExtra.writeJson(filePath, json_1);
  }
}

function generateDate(timestamp) {
  try {
    if (timestamp == null) timestamp = Date.now();
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'America/New_York',
      timeZoneName: 'short',
    });
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getRelativeTime(timestamp, type) {
  try {
    if (type == 's') {
      timestamp = Math.floor(timestamp * 1000);
    }
    return moment(timestamp).fromNow();
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

async function blacklistCheck(id) {
  try {
    const blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
    if (blacklist[id]) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function numberWithCommas(x) {
  try {
    return x
      .toString()
      .replace(/\s/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function addNotation(type, value) {
  try {
    let returnVal = value;
    let notList = [];
    if (type === 'shortScale') {
      notList = [' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion'];
    }
    if (type === 'oneLetters') {
      notList = ['k', 'm', 'b', 't'];
    }
    let checkNum = 1000;
    if (type !== 'none' && type !== 'commas') {
      let notValue = notList[notList.length - 1];
      for (let u = notList.length; u >= 1; u--) {
        notValue = notList.shift();
        for (let o = 3; o >= 1; o--) {
          if (value >= checkNum) {
            returnVal = value / (checkNum / 100);
            returnVal = Math.floor(returnVal);
            returnVal = (returnVal / Math.pow(10, o)) * 10;
            returnVal = +returnVal.toFixed(o) + notValue;
          }
          checkNum *= 10;
        }
      }
    } else {
      returnVal = numberWithCommas(value.toFixed(0));
    }
    return returnVal;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function toFixed(num, fixed) {
  try {
    if (fixed === undefined) fixed = 0;
    const response = new RegExp('^-?\\d+(?:\\.\\d{0,' + (fixed || -1) + '})?');
    const result = num.toString().match(response)[0];

    const parts = result.split('.');
    if (parts.length === 1 && fixed > 0) {
      parts.push('0'.repeat(fixed));
    } else if (parts.length === 2 && parts[1].length < fixed) {
      parts[1] = parts[1] + '0'.repeat(fixed - parts[1].length);
    }

    return parts.join('.');
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getMaxMembers(lvl) {
  try {
    if (lvl < 2) return 4;
    if (lvl < 6) return 8;
    if (lvl < 15) return 16;
    if (lvl < 24) return 26;
    if (lvl < 33) return 38;
    if (lvl < 42) return 48;
    if (lvl < 54) return 60;
    if (lvl < 66) return 72;
    if (lvl < 75) return 80;
    if (lvl < 81) return 86;
    if (lvl < 87) return 92;
    if (lvl < 93) return 98;
    if (lvl < 96) return 102;
    if (lvl < 99) return 106;
    if (lvl < 102) return 110;
    if (lvl < 105) return 114;
    if (lvl < 108) return 118;
    if (lvl < 111) return 122;
    if (lvl < 114) return 126;
    if (lvl < 117) return 130;
    if (lvl < 120) return 140;
    return 150;
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function capitalizeFirstLetter(str) {
  try {
    if (typeof str !== 'string' || str.length === 0) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (error) {
    var errorId = generateID(config.other.errorIdLength);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function cleanMessage(message) {
  return message
    .toString()
    .replaceAll('Error: ', '')
    .replaceAll('`', '')
    .replaceAll('ez', 'easy')
    .replaceAll('NO_ERROR_ID_', '')
    .replaceAll('_', ' ');
}

function convertToUnixTimestamp(dateString) {
  return new Date(dateString).getTime();
}

function fixGuildMemberData(data) {
  const result = {};
  Object.keys(data).forEach((rank) => {
    if (Object.keys(data[rank]).length > 0) {
      result[rank] = Object.keys(data[rank]).map((username) => {
        return {
          username: username,
          ...data[rank][username],
        };
      });
    } else {
      result[rank] = [];
    }
  });

  return result;
}

function getOnlineMembers(data) {
  let totalOnlineUsers = 0;

  Object.keys(data).forEach((role) => {
    if (Array.isArray(data[role])) {
      data[role].forEach((user) => {
        // Check if the user is online
        if (user.online === true) {
          totalOnlineUsers++;
        }
      });
    }
  });

  return totalOnlineUsers;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

module.exports = {
  generateID,
  formatUUID,
  writeAt,
  generateDate,
  getRelativeTime,
  blacklistCheck,
  numberWithCommas,
  addNotation,
  toFixed,
  getMaxMembers,
  capitalizeFirstLetter,
  cleanMessage,
  convertToUnixTimestamp,
  fixGuildMemberData,
  getOnlineMembers,
  hexToRgb,
};
