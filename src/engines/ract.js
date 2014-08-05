
register_engine('ract', function(params, next) {
  var Ractive = require('ractive');

  switch (next('js', 'us', 'hbs', 'html')) {
    case 'js':
      var tpl = Ractive.parse(params.source, defs_tpl('ractive', params)),
          body = 'var o=' + JSON.stringify(tpl) + ';return o.v&&o.t||o;';

      if (!params.chain) {
        return 'function(){' + body + '}';
      }

      /* jshint evil:true */
      return new Function('', body);

    default:
      return function(locals) {
        var tpl = new Ractive({
          template: params.source,
          data: locals
        });

        return tpl.toHTML();
      };
  }
});
