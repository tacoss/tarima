    describe 'Markup', ->
      describe 'Liquid', ->
        test ['x.liquid', '{% assign x = "y" %}{{x}}'], (result) ->
          expect(result.source).toEqual 'y'
          expect(result.extension).toEqual 'html'

      describe 'Markdown', ->
        test ['x.md', '# ok'], (result) ->
          expect(result.source).toContain '</h1>'
          expect(result.extension).toEqual 'html'

        test ['x.coffee.md', '> ok\n\n    foo bar'], (result) ->
          expect(result.source).toContain 'foo(bar)'
          expect(result.extension).toEqual 'js'

        test ['x.y.md', '# ok'], (result) ->
          expect(result.source).toContain '</h1>'
          expect(result.extension).toEqual 'y'

      describe 'Pug/Jade', ->
        test ['x.pug', 'x y'], (result) ->
          expect(result.source).toContain '<x>y</x>'
          expect(result.extension).toEqual 'html'

        test ['x.y.pug', 'x y'], (result) ->
          expect(result.source).toContain '<x>y</x>'
          expect(result.extension).toEqual 'y'

        test ['x.js.pug', 'x y'], (result) ->
          expect(result.source).toContain 'function'
          expect(result.extension).toEqual 'js'

        test ['x.js.jade', 'x y'], (result) ->
          expect(result.source).toContain 'function'
          expect(result.extension).toEqual 'js'

    describe 'Scripting', ->
      describe 'CoffeeScript', ->
        test ['x.coffee', 'foo bar'], (result) ->
          expect(result.source).toContain 'foo(bar)'
          expect(result.extension).toEqual 'js'

        test ['x.js.coffee', 'foo bar'], (result) ->
          expect(result.source).toContain 'foo(bar)'
          expect(result.extension).toEqual 'js'

        test ['x.litcoffee', '> ok\n\n    foo bar'], (result) ->
          expect(result.source).toContain 'foo(bar)'
          expect(result.extension).toEqual 'js'

        test ['x.y.litcoffee', '    foo bar'], (result) ->
          expect(result.source).toEqual '    foo bar'
          expect(result.extension).toEqual 'y'

        test ['x.js.litcoffee', '    foo bar'], (result) ->
          expect(result.source).toContain 'foo(bar);'
          expect(result.extension).toEqual 'js'

      describe 'ES6 (bublé)', ->
        test ['x.es6', 'export default () => 42'], (result) ->
          expect(result.source).toContain 'default function'
          expect(result.source).toContain 'return 42'
          expect(result.extension).toEqual 'js'

        test ['x.es6.js', 'export default () => 42'], (result) ->
          expect(result.source).toContain 'default function'
          expect(result.source).toContain 'return 42'
          expect(result.extension).toEqual 'js'

        test ['x.y.es6', 'export default 42'], (result) ->
          expect(result.source).toEqual 'export default 42'
          expect(result.extension).toEqual 'y'

      describe 'ES6 (traceur)', ->
        test [
          'x.es6'
          'export default () => 42',
          {
            'es6-compiler': 'traceur'
          }
        ], (result) ->
          expect(result.source).toContain 'module.exports'

      describe 'ES6 (babel)', ->
        test [
          'x.es6'
          'export default () => 42',
          {
            babel:
              presets: [['es2015', {}]]
          }
        ], (result) ->
          expect(result.source).toContain 'exports.default'

      describe 'TypeScript', ->
        test ['x.ts', 'let foo = (x: string) => {}'], (result) ->
          expect(result.source).toContain 'var foo'
          expect(result.source).toContain '(x)'

    describe 'Mixed', ->
      describe 'EJS', ->
        test ['x.ejs', '<%= 1 %>'], (result) ->
          expect(result.source).toEqual '1'
          expect(result.extension).toEqual 'html'

        test ['x.y.ejs', '<%= 1 %>'], (result) ->
          expect(result.source).toEqual '1'
          expect(result.extension).toEqual 'y'

        test ['x.js.ejs', '<%= 1 %>'], (result) ->
          expect(result.source).toContain 'function'
          expect(result.extension).toEqual 'js'

      describe 'Handlebars', ->
        test ['x.hbs', '<x>{{x}}</x>'], (result) ->
          expect(result.source).toContain '<x>y</x>'
          expect(result.extension).toEqual 'html'
        , x: 'y'

        test ['x.y.hbs', '<x>{{x}}</x>'], (result) ->
          expect(result.source).toContain '<x>y</x>'
          expect(result.extension).toEqual 'y'
        , x: 'y'

        test ['x.js.hbs', '<x>{{x}}</x>', { client: true }], (result) ->
          expect(result.source).toContain 'Handlebars.template'
          expect(result.extension).toEqual 'js'

    describe 'Stylesheets', ->
      describe 'SASS', ->
        test ['x.sass', '$x: red;\n*\n  color: $x'], (result) ->
          expect(result.source).toContain 'color: red'

      describe 'LESS', ->
        test ['x.less', '&*{x:@x}'], (result) ->
          expect(result.source).toContain '''
            * {
              x: y;
            }
          '''
          expect(result.extension).toEqual 'css'
        , { x: 'y', a: [] }

        test ['x.y.less', '&*{x:y}'], (result) ->
          expect(result.source).toEqual '&*{x:y}'
          expect(result.extension).toEqual 'y'

        test ['x.css.less', '&*{x:y}'], (result) ->
          expect(result.source).toContain 'x: y;'
          expect(result.extension).toEqual 'css'

      describe 'Styl', ->
        test ['x.styl', '*{x:y}'], (result) ->
          expect(result.source).toContain 'x: y;'
          expect(result.extension).toEqual 'css'

        test ['x.y.styl', '*{x:y}'], (result) ->
          expect(result.source).toEqual '*{x:y}'
          expect(result.extension).toEqual 'y'

      describe 'PostCSS', ->
        test ['x.css', '.x{color:red}'], (result) ->
          expect(result.source).toEqual '.x{color:red}'
          expect(result.extension).toEqual 'css'

        test ['x.y.css', '.x{color:red}'], (result) ->
          expect(result.source).toEqual '.x{color:red}'
          expect(result.extension).toEqual 'y'

        test [
          'x.post.css'
          ':fullscreen a{display:flex}'
          {
            postcss:
              plugins: ['autoprefixer']
          }
        ], (result) ->
          expect(result.source).toContain '-webkit'
          expect(result.source).toContain '-moz'
          expect(result.extension).toEqual 'css'

    describe 'Components: WIP', ->
      describe 'Moon', ->
        test ['x.moon', '<h1>{{value}}</h1>'], (result) ->
          expect(result.source).toContain '"h1"'
          expect(result.extension).toEqual 'js'

        test ['x.y.moon', '<h1>{{value}}</h1>'], (result) ->
          expect(result.source).toContain '<h1>{{value}}</h1>'
          expect(result.extension).toEqual 'y'

        test ['x.js.moon', '<h1>{{value}}</h1>'], (result) ->
          expect(result.source).toContain '"h1"'
          expect(result.extension).toEqual 'js'

      describe 'Ractive', ->
        test ['x.ract', '<x>{{"y"}}</x>'], (result) ->
          expect(result.source).toContain 'function'
          expect(result.extension).toEqual 'js'

        test ['x.y.ract', '<x>{{"y"}}</x>'], (result) ->
          expect(result.source).toContain '<x>{{"y"}}</x>'
          expect(result.extension).toEqual 'y'

        test ['x.js.ract', '<x>{{"y"}}</x>'], (result) ->
          expect(result.source).toContain 'function'
          expect(result.extension).toEqual 'js'

      describe 'Vue', ->
        test ['x.vue', '<h1>OK{{x}}</h1>'], (result) ->
          expect(result.source).toContain "'h1'"
          expect(result.source).toContain '"OK"'

        tpl = '''
          style(lang='less').
            @foo: red;

            * {
              color: @foo;
            }

          template
            h1 {{x}}

          script(lang='coffee').
            export default {
              data: ->
                x: 'y'
            }
          </script>
        '''

        test ['x.vue.pug', tpl], (result) ->
          expect(result.source).toContain 'data: function'
          expect(result.source).toContain "_c('h1',[_v(_s(x))])"
          expect(result.source).toContain '"*[vue-x] {\\n  color: red;\\n}\\n"'
          expect(result.source).toContain 'export default Vue.extend(__x$v)'

      describe 'Marko', ->
        test ['x.marko', 'div --- OK'], (result) ->
          expect(result.source).toContain 'require("marko/html")'

        test ['x.y.marko', 'div --- OK'], (result) ->
          expect(result.source).toEqual 'div --- OK'

        test ['x.js.marko', 'div --- OK', { client: true }], (result) ->
          expect(result.source).toContain 'require("marko/vdom")'

      if parseFloat(process.version.substr(1)) >= 6.0
        describe 'Svelte', ->
          test ['x.svelte', '<div>{{value}}</div>'], (result) ->
            expect(result.source).toContain 'module.exports = X;'

          test ['x.y.svelte', '<div>{{value}}</div>'], (result) ->
            expect(result.source).toContain '<div>{{value}}</div>'

          test ['x.js.svelte', '<div>{{value}}</div>', { client: true }], (result) ->
            expect(result.source).toContain 'export default X;'
