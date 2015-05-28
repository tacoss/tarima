'use strict';

var _ = require('lodash'),
    $ = require('./util');

module.exports = function(params) {
  var plugin = require('./');

  return {
    params: params,

    compile: function(locals) {
      var view = $.reduce(plugin.parsers, _.cloneDeep(params || {}), locals, true);

      return view.source;
    },

    render: function(locals) {
      var view = $.reduce(plugin.parsers, _.cloneDeep(params || {}), locals);

      if (typeof view.render === 'function') {
        return view.render(locals);
      }

      return view.source;
    }
  };
};
