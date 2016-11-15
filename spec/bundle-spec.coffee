describe 'bundling support', ->
  it 'should export single templates', (done) ->
    view = tarima('x.js.hbs.pug', 'h1 {{x}}')

    bundle(view).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /function.*?\(/
      expect(result.source).toContain 'module.exports'
      expect(result.source).not.toContain '"x":'
      expect(result.source).toContain 'require'
      done()

  it 'should export multiple templates', (done) ->
    views = [
      tarima('page.pug')
      tarima('x.js.hbs.pug', 'x {{y}}')
      tarima('x.js.ract.pug', 'a {{b}}')
      tarima('x.json', '{"foo":"bar"}')
    ]

    bundle(views).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /function.*?\(/
      expect(result.source).toContain 'module.exports'
      expect(result.source).toContain '"x":'
      expect(result.source).toContain 'require'
      expect(result.source).toContain '"x":{"foo":"bar"}'
      done()

  describe 'Rollup.js integration', ->
    it 'should bundle modules using rollup', (done) ->
      script = tarima('module_a.litcoffee')

      bundle(script).render (err, result) ->
        path = require('path')

        expect(err).toBeUndefined()
        expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
        expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

        expect(result.source).not.toContain 'require'
        expect(result.source).toContain 'return b'
        expect(result.source).toMatch /var b.* = 'x'/
        expect(result.source).toContain 'this.a = this.a || {}'
        expect(result.source).toContain 'this.a.b = this.a.b || {}'

        expect(result.source).toContain '_s(ok)'
        expect(result.source).toContain '_s(value)'
        expect(result.source).toContain 'x = Vue.extend'
        expect(result.source).toContain 'y = Vue.extend'

        done()

    it 'should fail bundling unsupported sources', (done) ->
      bundle(tarima('module_c.js')).render (err) ->
        expect(err).not.toBeUndefined()
        expect(err.message).toMatch /does not export default|'default' is not exported/
        done()

    it 'should bundle unsupported sources through plugins', (done) ->
      bundle(tarima('module_c.js'), rollup: { plugins: ['rollup-plugin-json'] }).render (err, result) ->
        expect(err).toBeUndefined()
        expect(result.source).not.toContain 'require'
        expect(result.source).toContain 'return data'
        expect(result.source).toMatch /var data.* = "x"/
        done()
