    describe 'bundling support', ->
      it 'should export single templates', (done) ->
        view = tarima('x.js.hbs.pug', 'h1 {{x}}')
        view.bundle (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toMatch /function.*?\(/
          expect(result.source).toContain 'module.exports'
          expect(result.source).not.toContain '"x":'
          expect(result.source).toContain 'require'
          done()

    describe 'Rollup.js integration', ->
      it 'should bundle modules using rollup', (done) ->
        script = tarima('module_a.litcoffee')
        script.bundle (err, result) ->
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

      it 'should bundle unsupported sources through plugins', (done) ->
        tarima('component.marko', rollup: {
          plugins:
            'rollup-plugin-node-resolve':
              jsnext: true
              main: true
              browser: true
              preferBuiltins: false
              extensions: ['.js', '.marko']
            'rollup-plugin-commonjs':
              include: ['node_modules/**', '**/*.marko', '**/*.js']
              extensions: ['.js', '.marko']
        })
        .bundle (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toContain 'createCommonjsModule'
          expect(result.source).toContain './component.marko'
          done()
