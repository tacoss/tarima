'use strict';

/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

const fs = require('fs-extra');
const path = require('path');
const clc = require('chalk');
const prettyMs = require('pretty-ms');
const micromatch = require('micromatch');

const CLR = '\x1b[K';

let notifier;

function env(value) {
  if (typeof value === 'string') {
    return value.replace(/\$\{(\w+)\}/g, (match, key) => {
      return process.env[key] || match;
    });
  }

  return value;
}

function echo() {
  process.stdout.write(Array.prototype.slice.call(arguments).join('')
    .replace(/\r\r/g, `${CLR}\r`)
    .replace(/\r\n/g, `${CLR}\n`));
}

function merge(target, source, keys) {
  keys = keys || [];

  Object.keys(source).forEach(key => {
    const value = source[key];

    const fixedKeys = keys.concat(key);

    if (Array.isArray(value) && (!target[key] || Array.isArray(target[key]))) {
      if (!target[key]) {
        target[key] = [];
      }

      value.forEach(item => {
        const fixedItem = env(item);

        if (target[key].indexOf(fixedItem) === -1) {
          target[key].push(fixedItem);
        }
      });
    } else if (value !== null && typeof value === 'object') {
      try {
        merge(target[key] || (target[key] = {}), value, fixedKeys);
      } catch (e) {
        throw new Error(`Merging failed at: ${fixedKeys.join('.')}`);
      }
    } else if (Array.isArray(target[key])) {
      const fixedValue = env(value);

      if (target[key].indexOf(fixedValue) === -1) {
        target[key].push(fixedValue);
      }
    } else if (typeof value !== 'undefined') {
      target[key] = env(value);
    }
  });
}

/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */

function extend(target) {
  const sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(source => {
    Object.keys(source).forEach(k => {
      if (typeof target[k] === 'undefined') {
        target[k] = source[k];
      }
    });
  });

  return target;
}

function flatten(items) {
  const out = [];

  items.forEach(set => {
    if (Array.isArray(set)) {
      Array.prototype.push.apply(out, flatten(set));
    } else if (set) {
      out.push(set);
    }
  });

  return out;
}

function isDir(filepath) {
  try {
    return fs.statSync(filepath).isDirectory();
  } catch (e) {
    // noop
  }
}

function isFile(filepath) {
  try {
    return fs.statSync(filepath).isFile();
  } catch (e) {
    // noop
  }
}

function exists(filepath) {
  return isDir(filepath) || isFile(filepath);
}

function timeDiff(start) {
  return prettyMs((new Date()) - start);
}

function mtime(filepath) {
  return exists(filepath) ? +fs.statSync(filepath).mtime : null;
}

function toArray(obj) {
  if (!obj) {
    return [];
  }

  return !Array.isArray(obj) ? [obj] : obj;
}

function notify(message, title, icon) {
  const noticeObj = { title, message };

  if (exists(icon)) {
    noticeObj.icon = path.resolve(icon);
  }

  process.nextTick(() => {
    try {
      notifier = notifier || require('node-notifier');
    } catch (e) { /* nothing */ }

    if (notifier) {
      notifier.notify(noticeObj);
    }
  });
}

function makeFilter(any, filters) {
  filters = filters.map(filter => {
    return micromatch.matcher(filter, {
      dot: true,
    });
  });

  // micromatch.filter() didn't work as expected
  return filepath => {
    let length = filters.length;
    let res = false;
    let pass = 0;

    while (length--) {
      if (filters[length](filepath)) {
        if (any) {
          res = true;
          break;
        }

        pass++;
      }
    }

    return res || pass === filters.length;
  };
}

module.exports = {
  echo,
  makeFilter,
  notify,
  merge,
  extend,
  exists,
  isDir,
  isFile,
  timeDiff,
  mtime,
  toArray,
  flatten,
  copy: fs.copySync,
  unlink: fs.unlinkSync,
  readJSON: fs.readJsonSync,
  writeJSON: fs.outputJsonSync,
  write: fs.outputFileSync,
  read: fs.readFileSync,
  color: clc,
};
