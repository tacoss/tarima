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

  it 'should bundle modules using browserify', (done) ->
    params =
      cache: {}

    script = tarima('module_a.es6.js')

    bundle(script, params).render (err, result) ->
      path = require('path')
      expect(err).toBeUndefined()
      expect(result.code).toContain 'function e(t,n,r)'
      cache = Object.keys(params.cache).map (f) -> path.basename(f)
      (result.track.map (f) -> path.basename(f)).forEach (f) ->
        expect(cache).toContain f
      done()
