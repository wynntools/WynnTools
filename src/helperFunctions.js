const config = require('../../config.json');
const fsExtra = require('fs-extra');
const { set } = require('lodash');
const mkdirp = require('mkdirp');
const moment = require('moment');

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

module.exports = {
  getCurrentTime,
  formatUUID,
  writeAt,
  generateDate,
  getRelativeTime,
};
