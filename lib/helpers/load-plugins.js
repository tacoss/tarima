'use strict';

module.exports = (plugins, options) => {
  options = options || {};

  if (!Array.isArray(plugins) && typeof plugins === 'object') {
    plugins = Object.keys(plugins).map(key => {
      options[key] = plugins[key];

      return key;
    });
  }

  return plugins.map(plugin => {
    if (typeof plugin === 'string') {
      /* eslint-disable global-require */
      const Plugin = require(plugin);

      if (typeof Plugin === 'function') {
        plugin = new Plugin(options[plugin] || {});
      }
    }

    return plugin;
  });
};
