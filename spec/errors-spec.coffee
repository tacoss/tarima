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

    return unless err

    (if Array.isArray(re) then re else [re]).forEach (expr) ->
      expect(err).toContain expr

describe 'expected errors', ->
  describe 'parse/syntax errors', ->
    test 'handlebars', ['x.js.hbs', 'Expecting', 'CLOSE_BLOCK_PARAMS'], ->
      $('x.js.hbs', '\n\n{{|').compile()

    test 'jade', ['x.js.jade:3', '> 3| x(', 'no closing bracket found'], ->
      $('x.js.jade', '\n\nx(').compile()

    test 'less', ['x.css.less:2', '> 2| x', 'Unrecognised input'], ->
      $('x.css.less', '\nx;y').compile()

    test 'coffee', ['x.js.coffee:2', '> 2| "', 'missing "'], ->
      $('x.js.coffee', '\n"\nx').compile()

    test 'imba', ['x.js.imba:2', '> 2| |x', "Unexpected 'LOGIC'"], ->
      $('x.js.imba', '\n|x').compile()

    test 'ractive', ['x.js.ract:2', 'Expected closing delimiter'], ->
      $('x.js.ract', '\n{{{x|').compile()

    test 'style', ['x.css.styl:1', "missing '{'"], ->
      $('x.css.styl', '\nx;y').compile()

    # TODO: missing extracts

    test 'EJS', ['x.js.ejs', 'close tag for "<%-"'], ->
      $('x.js.ejs', '\n<%-x').compile()

    test 'jisp', ['x.js.jisp', 'probably missing )'], ->
      $('x.js.jisp', '\n(x').compile()

  describe 'front-matter', ->
    test 'front-matter', ['x.html.jade:2', '(front-matter)'], ->
      $('x.html.jade', '//-\n  ---\n  x: "y"\n  !\n  ---').compile()
