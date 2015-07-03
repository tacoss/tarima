'use strict';

var $ = require('../util');

var coffee = require('coffee-script'),
    marked = require('marked');

function fixLiterate(code) {
  var lines = code.split('\n'),
      match, out = [];

  for (var line in lines) {
    line = lines[line];
    match = line.match(/^(\s{4}|\t)[\t\s]*(?=[^-*#])/);

    if (match && match[1]) {
      out.push(line.substr(match[1].length));
    } else if (/^\s*$/.test(line)) {
      out.push('');
    }
  }

  return out.join('\n');
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
