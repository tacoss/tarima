describe 'bundling support', ->
  it 'should export single templates', (done) ->
    view = tarima('x.js.ract.jade', 'h1 {{x}}')

    bundle(view).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /function.*?\(/
      expect(result.code).toContain 'module.exports'
      expect(result.code).not.toContain '"x.js.ract.jade"'
      done()

  it 'should export multiple templates', (done) ->
    views = [
      tarima('x.js.jade', 'x= y')
      tarima('x.js.ract.jade', 'a {{b}}')
    ]

    bundle(views).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /function.*?\(/
      expect(result.code).toContain 'module.exports'
      expect(result.code).toContain '"x.js.ract.jade"'
      done()
