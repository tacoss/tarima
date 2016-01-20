$ = require('./tarima')

test = (d, re, cb) ->
  it "should handle #{d}", ->
    err = null

    expect(->
      try
        cb()
      catch e
        err = e.message
        throw err
    ).toThrow()

    (if Array.isArray(re) then re else [re]).forEach (expr) ->
      expect(err).toContain expr

describe 'expected errors', ->
  describe 'parse/syntax errors', ->
    test 'handlebars', ['x.js.hbs', 'Expecting', 'CLOSE_BLOCK_PARAMS'], ->
      $('x.js.hbs', '\n\n{{|').compile()

    test 'jade', ['x.js.jade:3', '> 3| x('], ->
      $('x.js.jade', '\n\nx(').compile()

    test 'less', ['x.css.less:2', '> 2| x'], ->
      $('x.css.less', '\nx;y').compile()

    test 'coffee', ['x.js.coffee:2', '> 2| "'], ->
      $('x.js.coffee', '\n"\nx').compile()

