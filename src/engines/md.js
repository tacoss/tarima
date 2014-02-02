
var fixLiterate = function(code) {
  var lines = code.split('\n'),
      match, out = [];

  for (var line in lines) {
    line = lines[line];
    match = line.match(/^(\s{4}|\t)[\t\s]*(?=[^-*#])/);

    if (match && match[1]) {
      out.push(line.substr(match[1].length));
    }
  }

  return out.join('\n');
};

register_engine('md', function(params, next) {
  var opts = {},
      html, marked = require('marked');

  defaults(opts, defs_tpl('markdown', params.options));

  opts.renderer = new marked.Renderer();

  html = marked(params.source, opts);

  /* jshint evil:true */
  var fn = new Function('', 'return ' + JSON.stringify(html) + ';');

  if (next('js', 'html', 'ract', 'coffee')) {
    var exts = [params.next, params.ext];

    if (exts.indexOf('coffee') > -1) {
      return fixLiterate(params.source);
    }

    if (exts.indexOf('js') > -1) {
      return fn.toString();
    }

    return html;
  }

  return fn;
});
