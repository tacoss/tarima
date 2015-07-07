'use strict';

var $ = require('../util');

var coffee = require('coffee-script'),
    marked = require('marked');

// taken from coffee-script source
function fixLiterate(code) {
  var maybe_code = true,
      lines = [];

  code.split('\n').forEach(function(line) {
    if (maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line)) {
      lines.push(line);
    } else {
      maybe_code = /^\s*$/.test(line);

      if (maybe_code) {
        lines.push(line);
      } else {
        lines.push('# ' + line);
      }
    }
  });

  return lines.join('\n');
}

module.exports = function(tarima) {
  tarima.add('litcoffee', function(params) {
    if (params.next === 'js') {
      return coffee.compile(fixLiterate(params.source), $.configure('coffee', params));
    }
  });

  tarima.add('md', function(params) {
    if (params.next === 'coffee') {
      return fixLiterate(params.source);
    }

    var opts = {};

    $.defaults(opts, $.configure('marked', params));

    opts.renderer = new marked.Renderer();

    return marked(params.source, opts);
  });
};
