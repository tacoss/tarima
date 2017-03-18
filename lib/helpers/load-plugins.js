module.exports = function(plugins, options) {
  options = options || {};

  if (!Array.isArray(plugins) && typeof plugins === 'object') {
    plugins = Object.keys(plugins).map(function(key) {
      options[key] = plugins[key];

      return key;
    });
  }

  return plugins.map(function(plugin) {
    if (typeof plugin === 'string') {
      var pluginName = plugin;

      var Plugin = require(pluginName);

      if (typeof Plugin === 'function') {
        Plugin = new Plugin(options[pluginName] || {});
      }
    }

    return Plugin;
  });
};
