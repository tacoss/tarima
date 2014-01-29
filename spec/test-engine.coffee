
engines = require('./engines')

validateEngine = require("./validate-engines")
tarimaFixtures = require("./tarima-fixtures")

module.exports = (engine) ->
  testParamsAndContains = (from) ->
    ['params', 'contain'].forEach (type) ->
      from[type] = [from[type]] if 'string' is typeof from[type]

      if from[type]?.length
        for param in from[type]
          expect(from.partial.render(from.params)).toContain param

  describe "foo.#{engine}", ->
    it "should return as is (regular #{engine}-file)", ->
      foo_engine = tarimaFixtures("foo_#{engine}")

      expect(foo_engine.partial.compile(foo_engine.params)).toBe foo_engine.source
      expect(foo_engine.partial.render(foo_engine.params)).toBe foo_engine.source

  ###

    The evaluation chain works as follows:

    - Every engine will output string values as expected for html-makup, but sometimes will output js-code.
    - tpl.jade will output the origin jade-code as is
    - tpl.js.jade will output a self-contained jade callable function tpl(locals)
    - tpl.foo.jade will output html-markup (the default)
    - tpl.html.jade will output html-markup (by engine?)
    - tpl.jade.jade will return jade-code as is

    The html-engine always force to render()
    The js-engine always force to chain() or pre-compile
    If you want any jade template to be executed later use: tpl.js.jade
    If you want the resulting html-markup from the jade template use: tpl.html.jade

  ###

  unless engine is 'js'
    foo_js_engine = tarimaFixtures("foo_js_#{engine}")

    describe "foo.#{engine}.#{engine}", ->
      it "should return the #{engine}-code as is (#{engine}-engine, ...)", ->
        foo_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}")

        expect(foo_engine_engine.partial.render()).toBe foo_engine_engine.source
        expect(foo_engine_engine.partial.compile()).toBe foo_engine_engine.source

    describe "foo.#{engine}.#{engine}.#{engine}", ->
      it "should return the #{engine}-code as is (#{engine}-engine, ...)", ->
        foo_engine_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}_#{engine}")

        expect(foo_engine_engine_engine.partial.render()).toBe foo_engine_engine_engine.source
        expect(foo_engine_engine_engine.partial.compile()).toBe foo_engine_engine_engine.source

    describe "foo.js.#{engine}", ->
      it "compile() should return #{engine}-code precompiled to be called with tpl(locals)", ->
        expect(-> validateEngine(engine).pass(foo_js_engine.partial.compile(foo_js_engine.params))).not.toThrow()

      it "render() should execute and return from #{engine}-code (#{engine}-engine, js-engine, ...)", ->
        testParamsAndContains foo_js_engine

    describe "foo.#{engine}.js.#{engine}", ->
      foo_engine_js_engine = tarimaFixtures("foo_#{engine}_js_#{engine}")

      it "using render() and compile() would return the #{engine}-code as js-code (#{engine}-engine, js-engine, ...)", ->
        testParamsAndContains foo_engine_js_engine
        expect(-> validateEngine(engine).pass(foo_engine_js_engine.partial.render(foo_engine_js_engine.params))).not.toThrow()
        expect(-> validateEngine(engine).pass(foo_engine_js_engine.partial.compile(foo_engine_js_engine.params))).not.toThrow()

    describe "foo.js.js.#{engine}", ->
      foo_js_js_engine = foo_js_engine.partial.override("foo.js.js.#{engine}")

      it "using compile() and render() would return precompiled js-code (#{engine} into js, ...)", ->
        testParamsAndContains foo_js_js_engine
        expect(-> validateEngine(engine).pass(foo_js_js_engine.render(foo_js_engine.params))).not.toThrow()
        expect(-> validateEngine(engine).pass(foo_js_js_engine.compile(foo_js_engine.params))).not.toThrow()

    xdescribe "foo.js.#{engine}.js", ->
      foo_js_engine_js = foo_js_engine.partial.override("foo.js.#{engine}.js")

      it "using compile() and render() would throw error due invalid valid js-code (js-engine, #{engine} into js, ...)", ->
        testParamsAndContains foo_js_engine_js
        expect(-> foo_js_engine_js.render(foo_js_engine.params)).toThrow()
        expect(-> foo_js_engine_js.compile(foo_js_engine.params)).toThrow()

  else
    describe "foo.#{engine}.#{engine}", ->
      it "should return #{engine}-code precompiled to be called with tpl(locals)", ->
        foo_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}")

        testParamsAndContains foo_engine_engine
        expect(-> validateEngine(engine).pass(foo_engine_engine.partial.render(foo_engine_engine.params))).not.toThrow()
        expect(-> validateEngine(engine).pass(foo_engine_engine.partial.compile(foo_engine_engine.params))).not.toThrow()

    describe "foo.#{engine}.#{engine}.#{engine}", ->
      it "should execute templates just-one-time by type (just don't be mad)", ->
        foo_engine_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}_#{engine}")

        testParamsAndContains foo_engine_engine_engine
        expect(-> validateEngine(engine).pass(foo_engine_engine_engine.partial.render(foo_engine_engine_engine.params))).not.toThrow()
        expect(-> validateEngine(engine).pass(foo_engine_engine_engine.partial.compile(foo_engine_engine_engine.params))).not.toThrow()

  describe "foo.#{engine}.bar", ->
    it "should return #{engine}-code as is (unknown bar-engine, regular #{engine}-file)", ->
      foo_engine_bar = tarimaFixtures("foo_#{engine}_bar")

      testParamsAndContains foo_engine_bar
      expect(-> validateEngine(engine).notPass(foo_engine_bar.partial.compile(foo_engine_bar.params))).not.toThrow()

  describe "tpl.foo.#{engine}", ->
    it "should execute and return from #{engine}-code (#{engine}-engine, unknown foo-engine)", ->
      tpl_foo_engine = tarimaFixtures("tpl_foo_#{engine}")

      expect(-> validateEngine(engine).notPass(tpl_foo_engine.partial.render(tpl_foo_engine.params))).not.toThrow()
      expect(-> validateEngine(engine).notPass(tpl_foo_engine.partial.compile(tpl_foo_engine.params))).not.toThrow()

  describe "tpl.foo.#{engine}.bar", ->
    it "should return #{engine}-code as is (unknown bar-engine, cancel any further compilation)", ->
      tpl_foo_engine_bar = tarimaFixtures("tpl_foo_#{engine}_bar")

      testParamsAndContains tpl_foo_engine_bar
      expect(-> validateEngine(engine).notPass(tpl_foo_engine_bar.partial.compile(tpl_foo_engine_bar.params))).not.toThrow()

  require("./engines/#{engine}-specs")
