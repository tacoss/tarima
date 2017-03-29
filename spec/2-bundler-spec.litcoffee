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

    describe 'Rollup.js integration', ->
      it 'should bundle modules using rollup', (done) ->
        script = tarima('module_a.litcoffee')
        script.bundle (err, result) ->
          path = require('path')

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
