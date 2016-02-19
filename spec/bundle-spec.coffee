describe 'bundling support', ->
  it 'should export single templates', (done) ->
    view = tarima('x.js.ract.jade', 'h1 {{x}}')

    bundle(view).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /function.*?\(/
      expect(result.code).toContain 'module.exports'
      expect(result.code).not.toContain '"x":'
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
      expect(result.code).toContain '"x":'
      done()

  it 'should bundle if source has requires', (done) ->
    params =
      cache: {}

    script = tarima('x.es6.js', 'import pkg from "./package.json"')

    bundle(script, params).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toContain 'function e(t,n,r)'
      expect(result.code).toContain 'require("./package.json")'
      expect(params.cache['_stream_0.js']).not.toBeUndefined()
      expect(params.cache[require.resolve('../package.json')]).not.toBeUndefined()
      expect(result.required).toContain require.resolve('../package.json')
      done()
