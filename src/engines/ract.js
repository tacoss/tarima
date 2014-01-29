
register_engine('ract', function(params) {
  var tpl = require('ractive').parse(params.source, defs_tpl('ractive', params.options)),
      body = 'return ' + ('string' === typeof tpl ? tpl : JSON.stringify(tpl)) + ';';

  if ('js' === params.next) {
    return body;
  }

  if ('ract' !== params.next) {
    /* jshint evil:true */
    return !params.call ? params.source : new Function('', body);
  }
});
