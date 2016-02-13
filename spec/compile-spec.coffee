describe 'compileClient support', ->
  it 'should pre-compile jade templates', (done) ->
    tarima('x.js.jade', 'h1 x').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /function.*?locals/
      done()

  it 'should pre-compile ractive templates', (done) ->
    tarima('x.js.ract', '<i>x</i>').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toContain 'function'
      done()
