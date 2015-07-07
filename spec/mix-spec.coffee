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

      expect(code).toContain '["OK"]'
      expect(code).toContain '"r":"option"'
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
