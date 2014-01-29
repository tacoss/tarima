
engines = require('./engines')

validateEngine = require('./validate-engines')
tarimaFixtures = require('./tarima-fixtures')
tarima = require('../lib/tarima')
check = require('./checks')

spec = (file, fixture) ->
  it "#{fixture.label} (#{file})", ->
    file_engine = tarima.parse file, fixture.source
    callback = if fixture.compiles then 'compile' else 'render'

    if fixture.validate
      expect(-> file_engine[callback](fixture.params)).not.toThrow()
      expect(-> validateEngine(fixture.engine).pass(file_engine[callback](fixture.params))).not.toThrow()

    if fixture.invalidate
      expect(-> file_engine[callback](fixture.params)).not.toThrow()
      expect(-> validateEngine(fixture.engine).notPass(file_engine[callback](fixture.params))).not.toThrow()

    expect(-> check(fixture, file_engine[callback](fixture.params))).not.toThrow()


module.exports = (engine) ->
  return unless fixtures = tarimaFixtures(engine)

  describe "#{engine}-engine", ->
    it "should validate plain #{engine}-to-js integrity (file.js.#{engine})", ->
      fixtures.engine = engine
      sample = tarima.parse "file.js.#{engine}", ''

      expect(-> sample.render()).not.toThrow()
      expect(-> sample.compile()).not.toThrow()

      expect(-> validateEngine(engine).pass()).toThrow()
      expect(-> validateEngine(engine).notPass()).not.toThrow()
      expect(-> validateEngine(engine).pass(sample.render())).not.toThrow()
      expect(-> validateEngine(engine).pass(sample.compile())).not.toThrow()

      expect(-> check(fixtures, sample.render())).not.toThrow()
      expect(-> check(fixtures, sample.compile())).not.toThrow()

    if fixtures.fixtures
      for file, fixture of fixtures.fixtures
        fixture.engine = engine
        spec(file, fixture)

        require("./engines/#{engine}-specs")

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
