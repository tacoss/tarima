
validateEngine = require('./validate-engines')

module.exports = (from, source, negative) ->
  try
    strings = if negative then from.missing else from.contain
    strings = [strings] if 'object' isnt typeof strings

    if strings?.length
      unless negative and from.params
        strings.push(value) for value of from.params

      for fragment in strings
        unless negative
          expect(source).toContain fragment
        else
          expect(source).not.toContain fragment
    else
      throw "Missing some asserts for #{from.engine}-engine?"
  catch e
    throw e
