'use strict';

/* eslint-disable no-restricted-syntax */

const $ = require('./utils');

module.exports = cacheFile => {
  const cache = $.isFile(cacheFile)
    ? $.readJSON(cacheFile) || {}
    : {};

  return {
    all() {
      return cache;
    },
    rm(key) {
      delete cache[key];
    },
    get(key) {
      return cache[key];
    },
    set(key, val, x) {
      if (x) {
        if (!cache[key]) {
          cache[key] = {};
        }

        cache[key][val] = x;
      } else {
        cache[key] = val;
      }
    },
    unset(key, prop) {
      delete cache[key][prop];
    },
    find(key) {
      if (cache[key]) {
        return {
          id: key,
          entry: cache[key],
        };
      }

      for (const file in cache) {
        if (cache[file].id === key) {
          return {
            id: file,
            entry: cache[file],
          };
        }

        if (file.indexOf(key) > -1) {
          return {
            id: file,
            entry: cache[file],
          };
        }
      }
    },
    each(fn) {
      Object.keys(cache)
        .forEach(key => fn(cache[key], key));
    },
    save() {
      if (cacheFile) {
        Object.keys(cache).forEach(id => {
          if (cache[id].deleted || !$.exists(id)) {
            delete cache[id];
            return;
          }

          if (cache[id].dirty === false) {
            delete cache[id].dirty;
          }

          if (!cache[id].mtime) {
            cache[id].mtime = $.mtime(id);
          }
        });

        $.writeJSON(cacheFile, cache);
      }
    },
  };
};
