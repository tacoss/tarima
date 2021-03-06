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
      if (typeof x !== 'undefined') {
        if (!cache[key]) {
          cache[key] = {};
        }

        cache[key][val] = x;
      } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
          cache[key] = [].concat(cache[key] || []).concat(val);
        } else {
          cache[key] = cache[key] || {};

          Object.keys(val).forEach(k => {
            cache[key][k] = val[k];
          });
        }
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

      const keys = Object.keys(cache);
      const max = keys.length;

      for (let i = 0; i < max; i += 1) {
        const file = keys[i];

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

          // cleanup
          delete cache[id]._offset;

          if (cache[id].dirty === false) {
            delete cache[id].dirty;
            delete cache[id].mtime;
          }

          if (!cache[id].mtime) {
            cache[id].mtime = $.mtime(id);
          }
        });

        $.writeJSON(cacheFile, cache, {
          spaces: 2,
        });
      }
    },
    reset() {
      Object.keys(cache).forEach(key => {
        delete cache[key];
      });
    },
  };
};
