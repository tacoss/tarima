
engines = require('./engines')

validateEngine = require('./validate-engines')
tarimaFixtures = require('./fixtures')
tarima = require('../lib/tarima')
check = require('./checks')

type = (obj) ->
  Object.prototype.toString.call(obj).match(/object (\w+)/)[1].toLowerCase()

spec = (file, fixture) ->
  it "#{file} -- #{fixture.label}", ->
    callback = if fixture.compiled then 'compile' else 'render'
    fixture.partial = tarima.parse file, fixture.source
    validate fixture, callback

validate = (fixture, callback) ->
  if fixture.validate
    expect(-> fixture.partial[callback](fixture.params)).not.toThrow()
    expect(-> validateEngine(fixture.engine).pass(fixture.partial[callback](fixture.params))).not.toThrow()
  else if fixture.invalidate
    expect(-> fixture.partial[callback](fixture.params)).not.toThrow()
    expect(-> validateEngine(fixture.engine).notPass(fixture.partial[callback](fixture.params))).not.toThrow()

  unless fixture.throws
    expect(-> check(fixture, fixture.partial[callback](fixture.params))).not.toThrow()
  else
    expect(-> fixture.partial[callback](fixture.params)).toThrow()

  if fixture.sameinput
    expect(fixture.partial[callback](fixture.params)).toEqual fixture.source

  if fixture.typeof
    expect(type(fixture.partial[callback](fixture.params))).toBe fixture.typeof


module.exports = (engine) ->
  return unless fixtures = tarimaFixtures(engine)

  describe "#{engine}-engine", ->
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
