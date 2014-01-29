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

  # fun.js
  tarima.add('fun', function(params) {
    var compile = function(exec) {
      var fun = require('fun-template-engine'),
          parser = fun.parser(params.source);

      return exec ? function(locals) { return parser.render(locals); } : fun.precompile();
    };

    return compile(!params.next && params.call);
  });

  Other task to accomplish is testing our engines are working properly.

  # fun-fixtures.yml
  file_fun:
    key: value
    source: |
      [{ foo -> bar }]

  Testing engines:

  # fun-specs.coffee
  validateEngine = require('../validate-engines')
  tarimaFixtures = require('../tarima-fixtures')

  xdescribe 'file_fun', ->
    xit 'test', ->
      # load required fixtures
      file_fun = tarimaFixtures('file_fun')

      # validate the output?
      expect(file_fun.partial.compile(file_fun.params)).toBe file_fun.source
      expect(file_fun.partial.render(file_fun.params)).toBe file_fun.source

      # validate fun-engine if needed
      expect(-> validatefun('fun').notPass(file_fixture_fun.partial.render(file_fixture_fun.params))).toThrow()
      expect(-> validatefun('fun').pass(file_fixture_fun.partial.compile(file_fixture_fun.params))).not.toThrow()

  */

  include('engines/coffee.js');
  include('engines/eco.js');
  include('engines/ejs.js');
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
