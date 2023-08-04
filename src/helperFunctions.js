const config = require('../config.json');
const fsExtra = require('fs-extra');
const { set } = require('lodash');
const mkdirp = require('mkdirp');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

const getDirName = require('path').dirname;

function getCurrentTime() {
  if (config.other.timezone === null) {
    return new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  } else {
    return new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: config.other.timezone,
    });
  }
}

function formatUUID(uuid) {
  return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

async function writeAt(filePath, jsonPath, value) {
  mkdirp.sync(getDirName(filePath));
  try {
    const json = await fsExtra.readJson(filePath);
    set(json, jsonPath, value);
    return await fsExtra.writeJson(filePath, json);
  } catch (error) {
    console.log(error);
    // eslint-disable-next-line
    const json_1 = {};
    set(json_1, jsonPath, value);
    return await fsExtra.writeJson(filePath, json_1);
  }
}

function generateDate(timestamp) {
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
}

function getRelativeTime(timestamp, type) {
  // s = unix-seconds, ms = unix-milliseconds
  if (type == 's') {
    timestamp = Math.floor(timestamp * 1000);
  }
  return moment(timestamp).fromNow();
}

async function blacklistCheck(id) {
  const blacklist = await JSON.parse(fs.readFileSync('data/blacklist.json', 'utf8'));
  if (blacklist[id]) {
    return true;
  } else {
    return false;
  }
}
function countLinesAndCharacters(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  const totalLines = lines.length;
  const totalCharacters = fileContent.replace(/\s/g, '').length;
  const totalWhitespace = fileContent.match(/\s/g)?.length || 0;
  return { totalLines, totalCharacters, totalWhitespace };
}

function isJavaScriptFile(file) {
  return path.extname(file) === '.js';
}

function countStatsInDirectory(dirPath) {
  let totalFiles = 0;
  let totalLines = 0;
  let totalCharacters = 0;
  let totalWhitespace = 0;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      if (!filePath.includes('node_modules') && isJavaScriptFile(file)) {
        const {
          totalLines: lines,
          totalCharacters: chars,
          totalWhitespace: whitespace,
        } = countLinesAndCharacters(filePath);
        totalFiles++;
        totalLines += lines;
        totalCharacters += chars;
        totalWhitespace += whitespace;
      }
    } else if (stat.isDirectory() && !filePath.includes('node_modules')) {
      const {
        totalFiles: dirFiles,
        totalLines: dirLines,
        totalCharacters: dirChars,
        totalWhitespace: dirWhitespace,
      } = countStatsInDirectory(filePath);
      totalFiles += dirFiles;
      totalLines += dirLines;
      totalCharacters += dirChars;
      totalWhitespace += dirWhitespace;
    }
  });

  return { totalFiles, totalLines, totalCharacters, totalWhitespace };
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function addNotation(type, value) {
  let returnVal = value;
  let notList = [];
  if (type === 'shortScale') {
    notList = [' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion'];
  }

  if (type === 'oneLetters') {
    notList = ['K', 'M', 'B', 'T'];
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
          returnVal = +returnVal.toFixed(o - 1) + notValue;
        }
        checkNum *= 10;
      }
    }
  } else {
    returnVal = numberWithCommas(value.toFixed(0));
  }

  return returnVal;
}

function toFixed(num, fixed) {
  const response = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?');
  return num.toString().match(response)[0];
}

function getMaxMembers(lvl) {
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
}

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return ''; // Return an empty string if the input is not a valid non-empty string
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateID(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
    charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function cleanUpTimestampData(data) {
  try {
    const twelveHoursAgo = Math.floor(Date.now() / 1000) - 12 * 60 * 60;
    const filteredData = data.data.filter((entry) => {
      return entry.timestamp >= twelveHoursAgo && new Date(entry.timestamp * 1000).getMinutes() === 0;
    });
    return filteredData;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getCurrentTime,
  formatUUID,
  writeAt,
  generateDate,
  getRelativeTime,
  blacklistCheck,
  countLinesAndCharacters,
  countStatsInDirectory,
  addNotation,
  toFixed,
  getMaxMembers,
  capitalizeFirstLetter,
  generateID,
  cleanUpTimestampData,
};
