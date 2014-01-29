###

  Ir order the check compatibility between engines we need a jasmine custom matcher, see below.

  validateEngine(type).pass(source)
  validateEngine(type).notPass(source)

  If you want to check for another source fragment use this:

  validateEngine(type).pass(source).toContain(fragment)

  Almost every jasmine matcher would work. ;-)

###

tarimaFixtures = require('./tarima-fixtures')

runTest = (source, invalidateEngine) ->
  (type) ->
    unless fragments = tarimaFixtures(type)
      throw "Engine '#{type}' not supported?"

    if fragments.contain?.length
      try
        for code in fragments.contain
          source.should.toContain(code)
      catch e
        throw """
          Invalid source for #{type}-engine (#{source.actual})
          #{e.message}
          #{e.stack}
        """

getExpect = (that, negative) ->
  srcTest = if negative
    expect(that).not
  else
    expect(that)

  srcTest.should = srcTest
  srcTest

getValidator = (type) ->
  invalidate = (src) ->
    (subtype) ->
      getValidator(subtype).notPass(src)

  truthyEngine = (src) ->
    runTest(getExpect(src), invalidate(src))(type)
    getExpect(src)

  falsyEngine = (src) ->
    runTest(getExpect(src, true), invalidate(src))(type)
    getExpect(src)

  pass: (src) -> truthyEngine src
  notPass: (src) -> falsyEngine src

module.exports = (type) ->
  getValidator type
