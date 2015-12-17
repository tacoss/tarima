$ = require('./tarima')

describe 'mixing engines', ->
  describe 'x.litcoffee.hbs.ejs', ->
    tpl = '''
      # <%= title || 'Untitled' %>

      {{#option}}
          fun = ->
      {{/option}}{{^option}}
          class Klass; fun = new Klass
      {{/option}}
    '''

    view = $('x.litcoffee.hbs.ejs', tpl)

    it 'should return modified CoffeeScript calling render() and compile()', ->
      code = view.render(title: off)

      expect(code).toContain '# Untitled'
      expect(code).toContain 'class Klass'
      expect(code).not.toContain 'fun = ->'

      params =
        title: (new Date()).toString()

      expect(view.compile(params)).toBe view.render(params)

  describe 'x.js.ract.jade.ejs', ->
    tpl = '''
      h1 <%= title || 'Untitled' %>

      |{{#option}}
      div I am a div
      |{{/option}}{{^option}}
      span I am a span
      |{{/option}}
    '''

    view = $('x.js.ract.jade.ejs', tpl)

    it 'should return a plain object calling render()', ->
      expect(view.render(title: off).v).toBe 3

    it 'should return a Ractive.js template calling compile()', ->
      code = view.compile(title: 'OK')

      expect(code).toContain '"OK"'
      expect(code).toContain '"option"'
      expect(code).toContain '"I am a span"'
      expect(code).toContain 'function anonymous'

  describe 'x.y.js.coffee', ->
    it 'should return transpiled CoffeeScript calling render() and compile()', ->
      view = $('x.y.js.coffee', 'foo bar')
      code = view.render()

      expect(code).toContain 'foo(bar);'
      expect(code).toBe view.compile()

  describe 'x.js.ejs.jade', ->
    view = $('x.js.ejs.jade', 'h1 <%= x %>')

    it 'should return a rendered EJS template calling render()', ->
      code = view.render(x: 'OK')

      expect(code).toContain '<h1>OK</h1>'
      expect(code).not.toContain 'function'

    it 'should return a EJS template calling compile()', ->
      code = view.compile()

      expect(code).toContain 'escape(x)'
      expect(code).toContain 'function anonymous'

  describe 'x.js.coffee.md / y.js.litcoffee', ->
    it 'should return transpiled CoffeeScript calling render() and compile()', ->
      coffee_md = $('x.js.coffee.md', '    x y\n')
      litcoffee = $('x.js.litcoffee', '    x y\n')

      expect(coffee_md.render()).toBe litcoffee.compile()
      expect(litcoffee.render()).toBe coffee_md.compile()

  describe 'x.js.imba', ->
    it 'should return transpiled Imba calling render() and compile()', ->
      imba = $('x.js.imba', 'foo bar')

      expect(imba.render()).toBe imba.compile()
      expect(imba.render()).toContain 'this.foo'

  describe 'x.js.idom', ->
    it 'should return compiled IncrementalDOM calling render() and compile()', ->
      idom = $('x.js.idom', '<h1><%= data.value %></h1>')

      expect(idom.render()).toBe idom.compile()
      expect(idom.render()).toContain 'lib=IncrementalDOM'

  describe 'x.js.jisp', ->
    it 'should return compiled JISP calling render() and compile()', ->
      jisp = $('x.js.jisp', '(console.log "OK")')

      expect(jisp.render()).toBe jisp.compile()
      expect(jisp.render()).toContain 'console.log("OK")'

  describe 'x.css.styl', ->
    it 'should return compiled Styl calling render() and compile()', ->
      styl = $('x.css.styl', 'body\n  color: blue')

      expect(styl.render()).toBe styl.compile()
      expect(styl.render()).toContain 'color: blue;'

  describe 'x.jsx', ->
    it 'should return compiled JSX (es6) calling render() and compile()', ->
      jsx = $('x.jsx', 'let x = <y/>')

      expect(jsx.render()).toBe jsx.compile()
      expect(jsx.render()).toContain 'React.createElement'
