describe 'bundling support', ->
  it 'should export single templates', (done) ->
    view = tarima('x.js.hbs.jade', 'h1 {{x}}')

    bundle(view).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /function.*?\(/
      expect(result.source).toContain 'module.exports'
      expect(result.source).not.toContain '"x":'
      expect(result.source).toContain 'require'
      done()

  it 'should export multiple templates', (done) ->
    views = [
      tarima('page.jade')
      tarima('x.js.hbs.jade', 'x {{y}}')
      tarima('x.js.ract.jade', 'a {{b}}')
    ]

    bundle(views).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /function.*?\(/
      expect(result.source).toContain 'module.exports'
      expect(result.source).toContain '"x":'
      expect(result.source).toContain 'require'
      done()

  it 'should bundle modules using browserify', (done) ->
    params =
      cache: {}

    script = tarima('module_a.es6.js')

    bundle(script, params).render (err, result) ->
      path = require('path')

      expect(err).toBeUndefined()
      expect(result.source).toContain 'function e(t,n,r)'
      expect(result.source).toContain 'g.a ='
      expect(result.source).toContain 'g.b ='
      expect(result.source).toContain 'g.c ='
      expect(result.source).toContain 'var jade'
      expect(result.source).toContain 'module.exports=function'

      cache = Object.keys(params.cache).map (f) -> path.basename(f)
      (result.dependencies.map (f) -> path.basename(f)).forEach (f) ->
        expect(cache).toContain f
      done()
