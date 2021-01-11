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
      let Plugin = require(plugin);
      Plugin = Plugin.default || Plugin;

      if (typeof Plugin === 'function') {
        try {
          plugin = new Plugin(options[plugin] || {});
        } catch (e) {
          plugin = Plugin(options[plugin] || {});
        }
      } else {
        plugin = Plugin;
      }
    }

    return plugin;
  });
};
