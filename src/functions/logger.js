// Credits https://github.com/DuckySoLucky/hypixel-discord-chat-bridge/blob/f8a8a8e1e1c469127b8fcd03e6553b43f22b8250/src/Logger.js (Edited)
const customLevels = { cache: 0, command: 1, discord: 2, error: 3, script: 4, warn: 5, max: 6 };
const winston = require('winston');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');

// TODO Add logs flushing for logs older then 14d
// TODO Add cli-color support

const cacheLogger = winston.createLogger({
  level: 'cache',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'cache', filename: path.join(logDirectory, 'cache.log'), level: 'cache' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const commandLogger = winston.createLogger({
  level: 'command',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      name: 'command',
      filename: path.join(logDirectory, 'command.log'),
      level: 'command',
    }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const discordLogger = winston.createLogger({
  level: 'discord',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      name: 'discord',
      filename: path.join(logDirectory, 'discord.log'),
      level: 'discord',
    }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const errorLogger = winston.createLogger({
  level: 'error',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'error', filename: path.join(logDirectory, 'error.log'), level: 'error' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const scriptLogger = winston.createLogger({
  level: 'script',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'script', filename: path.join(logDirectory, 'script.log'), level: 'script' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const warnLogger = winston.createLogger({
  level: 'warn',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'warn', filename: path.join(logDirectory, 'warn.log'), level: 'warn' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const otherLogger = winston.createLogger({
  level: 'other',
  levels: customLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YY-MM-DD HH:mm:ss A' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} > ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ name: 'other', filename: path.join(logDirectory, 'other.log'), level: 'other' }),
    new winston.transports.File({ name: 'combined', filename: path.join(logDirectory, 'combined.log'), level: 'max' }),
    new winston.transports.Console({ levels: 'max' }),
  ],
});

const logger = {
  cache: (...args) => {
    return cacheLogger.cache(args.join(' > '));
  },
  command: (params) => {
    return commandLogger.command(params);
  },
  discord: (params) => {
    return discordLogger.discord(params);
  },
  error: (params) => {
    return errorLogger.error(params);
  },
  script: (params) => {
    return scriptLogger.script(params);
  },
  warn: (params) => {
    return warnLogger.warn(params);
  },
  other: (params) => {
    return otherLogger.other(params);
  },
};

async function updateMessage() {
  const columns = process.stdout.columns;
  const warning = 'IMPORTANT!';
  const message2 = 'Bot has updated, please restart the bot to apply changes!';
  const padding = ' '.repeat(Math.floor((columns - warning.length) / 2));
  const padding2 = ' '.repeat(Math.floor((columns - message2.length) / 2));
  // eslint-disable-next-line no-console
  console.log(padding + warning + padding + '\n' + padding2 + message2 + padding2);
}

module.exports = {
  discordMessage: logger.discord,
  commandMessage: logger.command,
  warnMessage: logger.warn,
  errorMessage: logger.error,
  scriptMessage: logger.script,
  cacheMessage: logger.cache,
  otherMessage: logger.other,
  updateMessage,
};
