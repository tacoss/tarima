###

  Ir order the check compatibility between engines we need a jasmine custom matcher, see below.

  validateEngine(type).pass(source)
  validateEngine(type).notPass(source)

  If you want to check for another source fragment use this:

  validateEngine(type).pass(source).toContain(fragment)

  Almost every jasmine matcher would work. ;-)

###

tarimaFixtures = require('./fixtures')

runTest = (type, source, negative) ->
  check_function = /\bfunction\s+(anonymous)?\s*\(/.test(source)

  if negative
    throw "Missing #{type}-code for notPass()" unless source
    throw """
      False positive function for #{type}-engine
      #{source}
    """ if check_function
  else
    throw "Missing #{type}-code for pass()" unless source
    throw """
      Invalid function for #{type}-engine
      #{source}
    """ unless check_function


module.exports = (type) ->
  pass: (src) -> runTest(type, src)
  notPass: (src) -> runTest(type, src, true)
