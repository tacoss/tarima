'use strict';

var $ = require('../util');

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
    var coffee = require('coffee-script');

    if (next('js')) {
      var code = coffee.compile(fixLiterate(params.source), tarima.config('coffee', params));

      var tpl = new Function('', code);

      if (!params.chain) {
        return tpl.toString();
      }

      return tpl;
    }
  });

  tarima.add('md', function(params, next) {
    var marked = require('marked');

    var type = next('js', 'ejs', 'hbs', 'html', 'ract', 'coffee');

    switch (type) {
      case 'coffee':
        return fixLiterate(params.source);

      default:
        var html,
            opts = {};

        $.defaults(opts, tarima.config('marked', params));

        opts.renderer = new marked.Renderer();

        html = marked(params.source, opts);

        if (type === 'js') {
          return new Function('', 'return ' + JSON.stringify(html) + ';');
        }

        return html;
    }
  });
};
