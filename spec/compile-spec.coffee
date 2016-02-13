describe 'compileClient support', ->
  it 'should pre-compile some templates to .js', (done) ->
    tarima('x.js.jade', 'h1 x').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /function.*?locals/
      done()
