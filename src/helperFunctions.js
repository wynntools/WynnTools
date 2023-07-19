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
};
