
var cleanLiterate = function(code) {
  var maybe_code = true, match,
      out = [], lines = code.split('\n');

  for (var line in lines) {
    line = lines[line];
    match = line.match(/^([ ]{4}|[ ]{0,3}\t)/);

    if (maybe_code && match) {
      out.push(line.substr(match[1].length));
    } else {
      maybe_code = /^\s*$/.test(line);
    }
  }

  return out.join('\n');
};

register_engine('coffee', function(params, coffee) {
  var body, tpl, fn;

  if (params.options.literate && 'coffee' === params.next) {
    params.source = cleanLiterate(params.source);
  }

  tpl =  coffee.compile(params.source, defs_tpl('coffee', params.options));
  body = 'with(locals_||{}){' + tpl.toString() + '};return "";';

  /* jshint evil:true */
  fn = new Function('locals_', body);

  if ('js' === params.next) {
    return fn.toString();
  }

  if ('coffee' !== params.next) {
    return !params.call ? fn(params.options.locals) : fn;
  }
}, require('coffee-script'));
