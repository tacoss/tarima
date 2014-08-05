(function () {
  'use strict';
  include('opts.js');
  include('debug.js');
  include('params.js');
  include('reduce.js');
  include('partial.js');
  include('methods.js');

  /*

  Basic behavior:

      render(partial.js.hbs) => render(hbs), run(js)
      render(partial.js.jade.hbs) => render(hbs), render(jade), run(js)
      render(partial.litcoffee.us) => render(us), compile(coffee)

      compile(partial.js.hbs) => compile(hbs)
      compile(partial.js.jade.hbs) => render(hbs), compile(jade)
      compile(partial.litcoffee.us) => compile(us)

  Defining engines:

      # fun.js
      tarima.add('fun', function(params, next) {
        var compile = function(client) {
          var fun = require('fun-template-engine'),
              parser = fun.parser(params.source);

          if (client) {
            return parser.precompile();
          }

          return function(locals) {
            return parser.render(locals);
          };
        };

        if (next('js', 'or', 'any', 'allowed', 'extension')) {
          return compile(!params.chain);
        }
      });

  */

  include('engines/coffee.js');
  include('engines/hbs.js');
  include('engines/html.js');
  include('engines/css.js');
  include('engines/jade.js');
  include('engines/js.js');
  include('engines/json.js');
  include('engines/less.js');
  include('engines/md.js');
  include('engines/ract.js');
  include('engines/us.js');
  include('engines/less.js');
})();
