describe 'supported engines', ->
  describe 'CoffeeScript', ->
    it 'x.coffee should transpile to x.js',
      test ['x.coffee', 'foo bar'], (result) ->
        expect(result.source).toContain 'foo(bar)'
        expect(result.extension).toEqual 'js'

    it 'x.js.coffee should not work (x.js)',
      test ['x.js.coffee', 'foo bar'], (result) ->
        expect(result.source).toEqual 'foo bar'
        expect(result.extension).toEqual 'js'

    it 'x.litcoffee should transpile to x.js',
      test ['x.litcoffee', '> ok\n\n    foo bar'], (result) ->
        expect(result.source).toContain 'foo(bar)'
        expect(result.extension).toEqual 'js'

    it 'x.y.litcoffee should not work (x.y)',
      test ['x.y.litcoffee', '    foo bar'], (result) ->
        expect(result.source).toEqual '    foo bar'
        expect(result.extension).toEqual 'y'

  describe 'ES6 (bublé)', ->
    it 'x.es6 should transpile to x.js',
      test ['x.es6', 'export default () => 42'], (result) ->
        expect(result.source).toContain 'default function'
        expect(result.source).toContain 'return 42'
        expect(result.extension).toEqual 'js'

    it 'x.es6.js should transpile to x.js',
      test ['x.es6.js', 'export default () => 42'], (result) ->
        expect(result.source).toContain 'default function'
        expect(result.source).toContain 'return 42'
        expect(result.extension).toEqual 'js'

    it 'x.y.es6 should not work (x.y)',
      test ['x.y.es6', 'export default 42'], (result) ->
        expect(result.source).toEqual 'export default 42'
        expect(result.extension).toEqual 'y'

  # TODO: ES6 (babel)

  describe 'IMBA', ->
    it 'x.imba should transpile to x.js',
      test ['x.imba', 'def test\n  "ok"'], (result) ->
        expect(result.source).toContain 'function test'
        expect(result.source).toContain 'return "ok"'
        expect(result.extension).toEqual 'js'

    it 'x.y.imba should not work (x.y)',
      test ['x.y.imba', 'def test\n  "ok"'], (result) ->
        expect(result.source).toEqual 'def test\n  "ok"'
        expect(result.extension).toEqual 'y'

  describe 'JISP', ->
    it 'x.jisp should transpile to x.js',
      test ['x.jisp', '(def test ("ok"))'], (result) ->
        expect(result.source).toContain 'function test'
        expect(result.source).toContain 'return "ok"'
        expect(result.extension).toEqual 'js'

    it 'x.y.jisp should not work (x.y)',
      test ['x.y.jisp', '(def test ("ok"))'], (result) ->
        expect(result.source).toEqual '(def test ("ok"))'
        expect(result.extension).toEqual 'y'

  describe 'IDOM', ->
    it 'x.idom should transpile to x.js',
      test ['x.idom', '<x>y</x>'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

    it 'x.y.idom should not work (x.y)',
      test ['x.y.idom', '<x>y</x>'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'y'

  describe 'Ractive', ->
    it 'x.ract should render to x.html',
      test ['x.ract', '<x>{{"y"}}</x>'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'html'

    it 'x.y.ract should transpile to x.y',
      test ['x.y.ract', '<x>{{"y"}}</x>'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'y'

    it 'x.js.ract should precompile to x.js',
      test ['x.js.ract', '<x>{{"y"}}</x>'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

  describe 'Pug', ->
    it 'x.pug should render to x.html',
      test ['x.pug', 'x y'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'html'

    it 'x.y.pug should transpile to x.y',
      test ['x.y.pug', 'x y'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'y'

    it 'x.js.pug should precompile to x.js',
      test ['x.js.pug', 'x y'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

    it 'x.js.jade should precompile to x.js (legacy)', ->
      test ['x.js.jade', 'x y'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

  describe 'LESS', ->
    it 'x.less should transpile to x.css',
      test ['x.less', '&*{x:@x}'], (result) ->
        expect(result.source).toContain '''
          * {
            x: y;
          }
        '''
        expect(result.extension).toEqual 'css'
      , { x: 'y', a: [] }

    it 'x.y.less should not work (x.y)',
      test ['x.y.less', '&*{x:y}'], (result) ->
        expect(result.source).toEqual '&*{x:y}'
        expect(result.extension).toEqual 'y'

    it 'x.js.less should precompile to x.js',
      test ['x.js.less', '&*{x:y}'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

  describe 'Styl', ->
    it 'x.styl should transpile to x.css',
      test ['x.styl', '*{x:y}'], (result) ->
        expect(result.source).toContain 'x: y;'
        expect(result.extension).toEqual 'css'

    it 'x.y.styl should not work (x.y)',
      test ['x.y.styl', '*{x:y}'], (result) ->
        expect(result.source).toEqual '*{x:y}'
        expect(result.extension).toEqual 'y'

  describe 'EJS', ->
    it 'x.ejs should transpile to x.html',
      test ['x.ejs', '<%= 1 %>'], (result) ->
        expect(result.source).toEqual '1'
        expect(result.extension).toEqual 'html'

    it 'x.y.ejs should transpile to x.y',
      test ['x.y.ejs', '<%= 1 %>'], (result) ->
        expect(result.source).toEqual '1'
        expect(result.extension).toEqual 'y'

    it 'x.js.ejs should precompile to x.js',
      test ['x.js.ejs', '<%= 1 %>'], (result) ->
        expect(result.source).toContain 'function'
        expect(result.extension).toEqual 'js'

  describe 'Kramed', ->
    it 'x.md should transpile to x.html',
      test ['x.md', '# ok'], (result) ->
        expect(result.source).toContain '</h1>'
        expect(result.extension).toEqual 'html'

    it 'x.coffee.md should transpile to x.js',
      test ['x.coffee.md', '> ok\n\n    foo bar'], (result) ->
        expect(result.source).toContain 'foo(bar)'
        expect(result.extension).toEqual 'js'

    it 'x.y.md should transpile to x.y',
      test ['x.y.md', '# ok'], (result) ->
        expect(result.source).toContain '</h1>'
        expect(result.extension).toEqual 'y'

  describe 'Handlebars', ->
    it 'x.hbs should transpile to x.html',
      test ['x.hbs', '<x>{{x}}</x>'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'html'
      , x: 'y'

    it 'x.y.hbs should transpile to x.y',
      test ['x.y.hbs', '<x>{{x}}</x>'], (result) ->
        expect(result.source).toContain '<x>y</x>'
        expect(result.extension).toEqual 'y'
      , x: 'y'

    it 'x.js.hbs should precompile to x.js',
      test ['x.js.hbs', '<x>{{x}}</x>'], (result) ->
        expect(result.source).toContain 'Handlebars.template'
        expect(result.extension).toEqual 'js'

  describe 'PostCSS', ->
    it 'css only',
      test ['x.css', '.x{color:red}'], (result) ->
        expect(result.source).toEqual '.x{color:red}'
        expect(result.extension).toEqual 'css'

    it 'with .js',
      test ['x.js.css', '.x{color:red}'], (result) ->
        expect(result.source).toEqual 'function(){return ".x{color:red}";}'
        expect(result.extension).toEqual 'js'

    it 'with .post',
      test ['x.post.css', '.x{color:red}'], (result) ->
        expect(result.source).toEqual '.x{color:red}'
        expect(result.extension).toEqual 'css'

    it 'with .js.post',
      test ['x.js.post.css', ':fullscreen a{display:flex}', postcss: { plugins: ['autoprefixer'] }], (result) ->
        expect(result.source).toContain 'function'
        expect(result.source).toContain '-webkit-box'
        expect(result.extension).toEqual 'js'
