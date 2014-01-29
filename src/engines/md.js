
register_engine('md', function(params, marked) {
  var opts = {},
      html;

  defaults(opts, defs_tpl('markdown', params.options));

  opts.renderer = new marked.Renderer();
  marked.setOptions(opts);

  html = marked(params.source);

  /* jshint evil:true */
  var fn = new Function('', 'return ' + JSON.stringify(html) + ';');

  if ('js' === params.next) {
    return fn.toString();
  }

  if ('md' !== params.next) {
    return !params.call ? html : fn;
  }
}, require('marked'));
