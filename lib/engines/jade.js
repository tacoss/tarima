'use strict';

var $ = require('../util');

var path = require('path');

var jade;

module.exports = function(tarima) {
  tarima.add('jade', function(params) {
    jade = jade || require('jade');

    if (params.filepath) {
      params.options.filename = path.join(params.filepath, params.filename);
    }

    var compile = function(client) {
      var options = $.configure('jade', params);

      // TODO: dirty and wasteful, having jade.compileWithDependenciesTracked() would be fine?
      var view = jade.compileClientWithDependenciesTracked(params.source, options);

      params.required = view.dependencies;

      if (client) {
        return view.body;
      }

      return jade.compile(params.source, options);
    };

    if (params.next === 'js' && params.client) {
      return compile(true).replace(/\n{2,}/g, '\n');
    }

    return compile();
  });
};
