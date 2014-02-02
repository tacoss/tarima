
register_engine('md', function(params, next) {
  var opts = {},
      html, marked = require('marked');

  defaults(opts, defs_tpl('markdown', params.options));

  opts.renderer = new marked.Renderer();

  html = marked(params.source, opts);

  /* jshint evil:true */
  var fn = new Function('', 'return ' + JSON.stringify(html) + ';');

  if (next('js', 'html', 'ract')) {
    if ([params.next, params.ext].indexOf('js') > 0) {
      return fn.toString();
    }

    return html;
  }

  return fn;
});
