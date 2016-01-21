var $ = require('../util');

var path = require('path');

var jade;

module.exports = function(tarima) {
  tarima.add('jade', function(params) {
    jade = jade || require('jade');

    params.options.filename = path.join(params.filepath, params.filename);

    var compile = function(client) {
      var method = client ? 'compileClientWithDependenciesTracked' : 'compile';

      var opts = $.configure('jade', params);

      opts.filename = path.join(params.filepath, params.filename);

      var view = jade[method](params.source, opts);

      params.required = view.dependencies;

      if (client) {
        return view.body;
      }

      return view;
    };

    if (params.next === 'js' && params.client) {
      return compile(true).replace(/\n{2,}/g, '\n');
    }

    return compile();
  });
};
