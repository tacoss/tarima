
var cleanLiterate = function(code, strip) {
  var maybe_code = true, match,
      out = [], lines = code.split('\n');

  for (var line in lines) {
    line = lines[line];
    match = line.match(/^([ ]{4}|[ ]{0,3}\t)/);

    if (maybe_code && match) {
      out.push(line.substr(match[1].length));
    } else {
      maybe_code = /^\s*$/.test(line);

      if (maybe_code && !strip) {
        out.push('# ' + line);
      }
    }
  }

  return out.join('\n');
};

register_engine('coffee', function(params, next) {
  var coffee = require('coffee-script');

  if (params.options.literate && next('coffee')) {
    params.source = cleanLiterate(params.source, params.options.strip);
  }

  var tpl =  coffee.compile(params.source, defs_tpl('coffee', params.options)),
      body = 'with(locals_||{}){' + tpl.toString() + '}',
      fn;

  /* jshint evil:true */
  fn = new Function('locals_', body);

  if (next('js')) {
    return fn.toString();
  }

  return fn;
});
