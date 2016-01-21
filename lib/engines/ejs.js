var $ = require('../util');

var path = require('path');

var ejs;

module.exports = function(tarima) {
  tarima.add('ejs', function(params) {
    function compile(client) {
      ejs = ejs || require('ejs');

      var opts = $.configure('ejs', params);

      opts.filename = path.join(params.filepath, params.filename);
      opts.client = !!client;

      return ejs.compile(params.source, opts);
    }

    if (params.next === 'js' && params.client) {
      return compile(true).toString();
    }

    return compile();
  });
};
