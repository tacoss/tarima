(function () {
  'use strict';
  include('opts.js');
  include('debug.js');
  include('params.js');
  include('reduce.js');
  include('partial.js');
  include('methods.js');

  /*

  The rules about interacting between engines are simple (?):

  - Return a runtime-callable function that produces another output given the engine by itself.
  - Return a the javascript source code representation for that code in form of a callable template.
. - Every engine receive context options to determine what output: a callable function, or source code.

  Defining engines:

  tarima.add('fun', function(params) {
    var compile = function(exec) {
      var fun = require('fun-template-engine'),
          parser = fun.parser(params.source);

      return exec ? function(locals) { return parser.render(locals); } : fun.precompile();
    };

    return compile(!params.next && params.call);
  });

  */

  include('engines/coffee.js');
  include('engines/eco.js');
  include('engines/ejs.js');
  include('engines/hbs.js');
  include('engines/html.js');
  include('engines/jade.js');
  include('engines/js.js');
  include('engines/json.js');
  include('engines/less.js');
  include('engines/md.js');
  include('engines/ract.js');
  include('engines/us.js');
  include('engines/less.js');
})();
