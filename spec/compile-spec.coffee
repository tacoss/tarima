describe 'compileClient support', ->
  it 'should pre-compile jade templates', (done) ->
    tarima('x.js.jade', 'h1 x').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /function.*?locals/
      done()

  it 'should pre-compile ractive templates', (done) ->
    tarima('x.js.ract', '<i>{{x}}</i>').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toContain '"x"'
      expect(result.source).toContain 'function'
      done()
