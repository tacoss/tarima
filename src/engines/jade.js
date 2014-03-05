
register_engine('jade', function(params, next) {
  var jade = require('jade');

  if (params.filepath) {
    params.options.filename = params.filepath + '/' + params.filename;
  }

  var compile = function(client) {
    var prefix = '';

    if (params.options.includes && params.options.includes.jade) {
      prefix = params.options.includes.jade.join('\n');
    }

    params.options.client = client;

    return jade.compile((prefix ? prefix + '\n' : '') + params.source, defs_tpl('jade', params.options));
  };

  if (!params.call || next('js', 'html', 'ract')) {
    if (!params.next && 'js' === params.ext) {
      return compile(true).toString();
    }
  }

  return compile();
});
