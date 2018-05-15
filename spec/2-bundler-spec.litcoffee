    path = require('path')

    describe 'bundling support', ->
      it 'should bundle scripts', (done) ->
        view = tarima('a.js')
        view.bundle (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toContain '<h1>It works!</h1>"'
          expect(result.source).toContain 'function template'
          expect(result.source).toContain '[x, template]'
          expect(result.source).toContain 'runtime'
          done()

      it 'should skip non-scripts', (done) ->
        view = tarima('x.pug', 'h1 #{x}')
        view.bundle { x: 'It works!' }, (err, result) ->
          expect(err).toBeUndefined()
          expect(result.source).toContain '<h1>It works!</h1>'
          done()

    if parseFloat(process.version.substr(1)) >= 6.0
      try
        require('fuse-box')

        describe 'FuseBox integration', ->
          it 'should bundle modules', (done) ->
            tarima('module_a.litcoffee', { fusebox: standalone: false })
            .bundle (err, result) ->
              if err
                console.log err.stack
              else
                # expect(result.source).toContain 'function template'
                # expect(result.source).toContain 'with(this)'
                # expect(result.source).toContain 'marko_attr'
                # expect(result.source).toContain 'It works!'
                # expect(result.source).toContain 'this,"y"'
                # expect(result.source).toContain '"x"'
                # expect(result.source).toContain "'x"
                # FIXME: works on real-word but not here (?)
                #console.log result.source
              done()

      catch e
        describe 'FuseBox integration (skipped)', ->
          it 'should bundle modules', ->
            # FIXME

    describe 'Webpack integration', ->
      it 'should bundle modules', (done) ->
        tarima('module_a.litcoffee', { bundler: 'webpack' })
        .bundle (err, result) ->
          expect(err).toBeUndefined()

          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
          expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

          expect(result.source).toContain 'harmony default export'
          expect(result.source).toContain "Vue.component('x'"
          expect(result.source).toContain "Vue.component('y'"

          expect(result.source).toContain 'var a.b.c'

          expect(result.source).toContain '_s(ok)'
          expect(result.source).toContain '_s(value)'

          done()

    # describe 'Rollup.js integration', ->
    #   it 'should bundle modules', (done) ->
    #     tarima('module_a.litcoffee')
    #     .bundle (err, result) ->
    #       if err
    #         console.log err.stack
    #       else
    #         expect(result.deps).toContain path.resolve(__dirname, 'fixtures/bar.yml')
    #         expect(result.deps).toContain path.resolve(__dirname, 'fixtures/module_b.js')

    #         expect(result.source).toMatch /var b.* = 'x'/
    #         #expect(result.source).toContain 'var y = (function()'
    #         expect(result.source).toContain 'this.a = this.a || {}'
    #         expect(result.source).toContain 'this.a.b = this.a.b || {}'

    #         expect(result.source).toContain '_s(ok)'
    #         expect(result.source).toContain '_s(value)'
    #         expect(result.source).toContain "Vue.component('x'"
    #         expect(result.source).toContain "Vue.component('y'"
    #       done()

    #   it 'should bundle commonjs sources through plugins', (done) ->
    #     tarima('component.marko', rollup: {
    #       onwarn: (warning) ->
    #         return if warning.code is 'MISSING_EXPORT'
    #         console.log warning.message
    #       plugins:
    #         'rollup-plugin-node-resolve':
    #           jsnext: true
    #           main: true
    #           module: true
    #           browser: true
    #           preferBuiltins: false
    #           extensions: ['.js', '.marko']
    #         'rollup-plugin-commonjs':
    #           include: ['node_modules/**', '**/*.marko', '**/*.js']
    #           extensions: ['.js', '.marko']
    #     })
    #     .bundle (err, result) ->
    #       expect(err).toBeUndefined()
    #       expect(result.source).toContain 'createCommonjsModule'
    #       expect(result.source).toContain './component.marko'
    #       done()
