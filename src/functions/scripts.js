const { generateID, cleanMessage } = require('./helper.js');
const { errorMessage, otherMessage } = require('./logger.js');
const path = require('path');
const fs = require('fs');

const scriptsPath = path.join(__dirname, '../scripts');

function getScripts() {
  try {
    return fs.readdirSync(scriptsPath).filter((file) => file.endsWith('.js'));
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getScriptFile(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    const { config, task } = require(`${scriptsPath}/${fileName}`);
    if (!config || !task) return 'No file found';
    return { config, task };
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getScriptConfig(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    const { config } = require(`${scriptsPath}/${fileName}`);
    if (!config) return 'No file found';
    return config;
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getScriptTask(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    const { task } = require(`${scriptsPath}/${fileName}`);
    if (!task) return 'No file found';
    return task;
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function getScriptStatus(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    var config = getScriptConfig(fileName);
    if (config.type != 'cron') return 'This script is not a cron script';
    return {
      running: config.running,
      enabled: config.enabled,
    };
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function startScript(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    var config = getScriptConfig(fileName);
    if (config.type != 'cron') return 'This script is not a cron script';
    config.running = true;
    var task = getScriptTask(fileName);
    task.start();
    return 'task started';
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function stopScript(fileName) {
  try {
    if (!fileName.endsWith('.js')) fileName += '.js';
    var config = getScriptConfig(fileName);
    if (config.type != 'cron') throw new Error('This script is not a cron script');
    config.running = false;
    var task = getScriptTask(fileName);
    task.stop();
    return 'task stopped';
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

function startAllScripts() {
  try {
    var scripts = getScripts();
    var results = [];
    for (let i = 0; i < scripts.length; i++) {
      try {
        var script = scripts[i];
        var config = getScriptConfig(script);
        if (config.type != 'cron') throw new Error('This script is not a cron script');
        if (config.running) throw new Error('This script is already running');
        if (!config.enabled) throw new Error('This script is disabled');
        var task = getScriptTask(script);
        task.start();
        config.running = true;
        results.push({
          script: script,
          status: 'started',
        });
      } catch (error) {
        errorMessage(error);
        results.push({
          script: script,
          status: 'error',
          error: cleanMessage(error),
        });
      }
    }
    otherMessage(results);
    return results;
  } catch (error) {
    var errorId = generateID(10);
    errorMessage(`Error Id - ${errorId}`);
    errorMessage(error);
    return error;
  }
}

module.exports = {
  getScripts,
  getScriptFile,
  getScriptConfig,
  getScriptTask,
  getScriptStatus,
  startScript,
  stopScript,
  startAllScripts,
};
