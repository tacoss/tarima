validateEngine = require("./validate-engines")
tarimaFixtures = require("./tarima-fixtures")

module.exports = (engine) ->
  describe "foo.#{engine}", ->
    it "should return as is (regular #{engine}-file)", ->
      foo_engine = tarimaFixtures("foo_#{engine}")

      expect(foo_engine.partial.compile(foo_engine.params)).toBe foo_engine.source
      expect(foo_engine.partial.render(foo_engine.params)).toBe foo_engine.source

  describe "foo.#{engine}.#{engine}", ->
    it "should return #{engine}-code precompiled to be called with tpl(locals)", ->
      foo_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}")

      expect(-> validateEngine(engine).pass(foo_engine_engine.partial.compile(foo_engine_engine.params))).not.toThrow()
      expect(-> validateEngine(engine).pass(foo_engine_engine.partial.render(foo_engine_engine.params))).not.toThrow()

  describe "foo.#{engine}.#{engine}.#{engine}", ->
    it "should precompile templates just one time if demanded (keep calm)", ->
      foo_engine_engine_engine = tarimaFixtures("foo_#{engine}_#{engine}_#{engine}")

      expect(-> validateEngine(engine).pass(foo_engine_engine_engine.partial.compile(foo_engine_engine_engine.params))).not.toThrow()
      expect(-> validateEngine(engine).pass(foo_engine_engine_engine.partial.render(foo_engine_engine_engine.params))).not.toThrow()

  describe "foo.#{engine}.bar", ->
    it "should return #{engine}-code as is (unknown bar-engine, regular #{engine}-file)", ->
      foo_engine_bar = tarimaFixtures("foo_#{engine}_bar")

      if foo_engine_bar.params and foo_engine_bar.contain
        for param in foo_engine_bar.contain
          expect(foo_engine_bar.partial.render(foo_engine_bar.params)).toContain param

      expect(-> validateEngine(engine).notPass(foo_engine_bar.partial.compile(foo_engine_bar.params))).not.toThrow()
      expect(foo_engine_bar.partial.render(foo_engine_bar.params)).toContain(foo_engine_bar.contain) if foo_engine_bar.contain

  describe "tpl.foo.#{engine}", ->
    it "should execute and return from #{engine}-code (#{engine}-engine, unknown foo-engine)", ->
      tpl_foo_engine = tarimaFixtures("tpl_foo_#{engine}")

      if tpl_foo_engine.params and tpl_foo_engine.contain
        for param in tpl_foo_engine.contain
          expect(tpl_foo_engine.partial.render(tpl_foo_engine.params)).toContain param

      expect(-> validateEngine(engine).pass(tpl_foo_engine.partial.compile(tpl_foo_engine.params))).not.toThrow()
      expect(tpl_foo_engine.partial.render(tpl_foo_engine.params)).toContain(tpl_foo_engine.contain) if tpl_foo_engine.contain

  describe "tpl.foo.#{engine}.bar", ->
    it "should return #{engine}-code as is (unknown bar-engine, cancel any further compilation)", ->
      tpl_foo_engine_bar = tarimaFixtures("tpl_foo_#{engine}_bar")

      if tpl_foo_engine_bar.params and tpl_foo_engine_bar.contain
        for param in tpl_foo_engine_bar.contain
          expect(tpl_foo_engine_bar.partial.render(tpl_foo_engine_bar.params)).toContain param

      expect(-> validateEngine(engine).notPass(tpl_foo_engine_bar.partial.compile(tpl_foo_engine_bar.params))).not.toThrow()
      expect(tpl_foo_engine_bar.partial.render(tpl_foo_engine_bar.params)).toContain(tpl_foo_engine_bar.contain) if tpl_foo_engine_bar.contain
