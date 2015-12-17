var $ = require('../util');

var path = require('path');

var ejs;

module.exports = function(tarima) {
  tarima.add('ejs', function(params) {
    function compile(client) {
      ejs = ejs || require('ejs');

      if (params.filepath) {
        params.options.filename = path.join(params.filepath, params.filename);
      }

      params.options.client = !!client;

      return ejs.compile(params.source, $.configure('ejs', params));
    }

    if (params.next === 'js' && params.client) {
      return compile(true).toString();
    }

    return compile();
  });
};
