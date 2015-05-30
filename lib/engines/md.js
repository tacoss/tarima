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
  tarima.add('litcoffee', function(params, next) {
    if (next('js')) {
      var code = coffee.compile(fixLiterate(params.source), $.configure('coffee', params));

      var tpl = new Function('', code);

      if (params.client) {
        return tpl.toString();
      }

      return tpl;
    }
  });

  tarima.add('md', function(params, next) {
    var engine = next('js', 'ejs', 'hbs', 'html', 'ract', 'coffee');

    switch (engine) {
      case 'coffee':
        return fixLiterate(params.source);

      default:
        var html,
            opts = {};

        $.defaults(opts, $.configure('marked', params));

        opts.renderer = new marked.Renderer();

        html = marked(params.source, opts);

        if (engine === 'js') {
          return new Function('', 'return ' + JSON.stringify(html) + ';');
        }

        return html;
    }
  });
};
