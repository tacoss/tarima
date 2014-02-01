
register_engine('md', function(params, next) {
  var opts = {},
      html, marked = require('marked');

  defaults(opts, defs_tpl('markdown', params.options));

  opts.renderer = new marked.Renderer();

  html = marked(params.source, opts);

  /* jshint evil:true */
  var fn = new Function('', 'return ' + JSON.stringify(html) + ';');

  if (next('js', 'html')) {
    if ([params.next, params.ext].indexOf('html') > 0) {
      return html;
    }

    return fn.toString();
  }

  return fn;
});
