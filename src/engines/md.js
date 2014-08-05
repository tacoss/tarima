
var fixLiterate = function(code) {
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
};

register_engine('litcoffee', function(params, next) {
  if (next('js')) {
    var coffee = require('coffee-script'),
        code = coffee.compile(fixLiterate(params.source), defs_tpl('coffee', params));

    /* jshint evil:true */
    var tpl = new Function('', code);

    if (!params.chain) {
      return tpl.toString();
    }

    return tpl;
  }
});

register_engine('md', function(params, next) {
  var marked = require('marked'),
      type = next('js', 'us', 'hbs', 'html', 'ract', 'coffee');

  switch (type) {
    case 'coffee':
      return fixLiterate(params.source);

    default:
      var html,
          opts = {};

      defaults(opts, defs_tpl('marked', params));

      opts.renderer = new marked.Renderer();

      html = marked(params.source, opts);

      if ('js' === type) {
        /* jshint evil:true */
        return new Function('', 'return ' + JSON.stringify(html) + ';');
      }

      return html;
  }
});
