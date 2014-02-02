
validateEngine = require('./validate-engines')

assertContain = (source, strings, negative) ->
  strings = [strings] if 'object' isnt typeof strings

  for fragment in strings
    unless negative
      expect(source).toContain fragment
    else
      expect(source).not.toContain fragment


module.exports = (from, source) ->
  try
    throw """
      Missing some asserts for #{from.engine}-engine?
      #{JSON.stringify from, null, '  '}
    """ unless from.source or (from.validate or from.invalidate)

    assertContain(source.toString(), from.contain) if from.contain
    assertContain(source.toString(), from.missing, true) if from.missing
  catch e
    throw "Failed asserts for #{from.engine}-engine (#{e.message})"
