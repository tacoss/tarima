    path = require('path')

    describe 'bundling support', ->
      it 'should bundle scripts', (done) ->
        view = tarima('a.js')
        view.bundle (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toContain 'require'
          expect(result.source).toContain 'runtime'
          expect(result.source).toContain 'function template'
          done()

      it 'should skip non-scripts', (done) ->
        view = tarima('x.pug', 'h1 #{x}')
        view.bundle { x: 'It works!' }, (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toContain '<h1>It works!</h1>'
          done()

    if parseFloat(process.version.substr(1)) >= 6.0
      describe 'FuseBox integration', ->
        it 'should bundle modules', (done) ->
          tarima('module_a.litcoffee', { bundler: 'fusebox' })
          .bundle (err, result) ->
            # FIXME
            # console.log err
            # console.log result.source
            done()

    describe 'Webpack integration', ->
      it 'should bundle modules', (done) ->
        tarima('module_a.litcoffee', { bundler: 'webpack' })
        .bundle (err, result) ->
          expect(err).toBeUndefined()

          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

          expect(result.source).toContain 'var a.b.c'

          expect(result.source).toContain '_s(ok)'
          expect(result.source).toContain '_s(value)'
          expect(result.source).toContain "Vue.component('x'"
          expect(result.source).toContain "Vue.component('y'"
          expect(result.source).toContain 'harmony default export'
          done()

    describe 'Rollup.js integration', ->
      it 'should bundle modules', (done) ->
        tarima('module_a.litcoffee')
        .bundle (err, result) ->
          expect(err).toBeUndefined()

          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

          expect(result.source).toContain 'return b'
          expect(result.source).toMatch /var b.* = 'x'/
          expect(result.source).toContain 'this.a = this.a || {}'
          expect(result.source).toContain 'this.a.b = this.a.b || {}'

          expect(result.source).toContain '_s(ok)'
          expect(result.source).toContain '_s(value)'
          expect(result.source).toContain 'x = Vue.extend'
          expect(result.source).toContain 'y = Vue.extend'
          expect(result.source).not.toContain '__VUE_WITH_STATEMENT__'
          done()

      it 'should bundle commonjs sources through plugins', (done) ->
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
