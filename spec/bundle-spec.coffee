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
      tarima('tpl_1.js.hbs.pug', 'x {{y}}')
      tarima('tpl_2.js.ract.pug', 'a {{b}}')
      tarima('data_1.json', '{"foo":"bar"}')
      tarima('style_1.less', '*{color:red}')
      tarima('style_2.js.less', '*{color:@var}')
    ]

    bundle(views).render (err, result) ->
      expect(err).toBeUndefined()

      try
        $ = module = { exports: {} }
        eval(result.source)

        expect($.exports.data_1).toEqual { foo: 'bar' }
        expect($.exports.style_1).toContain 'color: red;'
        expect($.exports.style_2({ var: 'cyan' })).toContain 'color: cyan;'
        expect($.exports.tpl_1()).toContain '<x></x>'
        expect($.exports.tpl_2().v).toEqual 4
        expect($.exports.page).toContain '<h1>It works!</h1>'
      catch e
        throw new Error 'This should not happen'
      finally
        done()

  describe 'Rollup.js integration', ->
    it 'should bundle modules using rollup', (done) ->
      script = tarima('module_a.litcoffee')

      bundle(script).render (err, result) ->
        path = require('path')

        expect(err).toBeUndefined()
        expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
        expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

        #expect(result.source).not.toContain 'require'
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
      bundle(tarima('module_c.js'), rollup: { plugins: [{
        load: (id) ->
          if id.indexOf('.txt') > -1
            return 'export default "TXT"'
          null
      }] }).render (err, result) ->
        expect(err).toBeUndefined()
        expect(result.source).not.toContain 'require'
        expect(result.source).toContain 'return data'
        expect(result.source).toMatch /var data.* = "TXT"/
        done()
