tarima = require('../lib')
engines = require('./engines')
testEngine = require('./test-engine')
validateEngine = require('./validate-engines')

describe 'Tarima will', ->
  describe 'validate engines', ->
    it 'would validate unsupported engines', ->
      expect(-> validateEngine().pass()).toThrow()

    for engine in engines
      expect(-> validateEngine(engine).notPass()).toThrow()
      expect(-> validateEngine(engine).pass()).toThrow()
      testEngine(engine)

  describe 'piping engines', ->
    it 'foo.litcoffee.hbs.us -- render() should produce modified coffee-code as is', ->
      foo_litcoffee_hbs_us = tarima.parse 'foo.litcoffee.hbs.us', '''
        # <%= title || 'Untitled' %>

        {{#option}}
            fun = ->
        {{/option}}{{^option}}
            class Klass; fun = new Klass
        {{/option}}
      '''

      expect(foo_litcoffee_hbs_us.render(title: off)).toContain 'class Klass'
      expect(foo_litcoffee_hbs_us.compile(title: off)).not.toContain 'Handlebars.template'

      expect(foo_litcoffee_hbs_us.render(title: 'FTW')).toContain 'class Klass'
      expect(foo_litcoffee_hbs_us.render(title: 'FTW')).not.toContain '# # FTW'
      expect(foo_litcoffee_hbs_us.render(title: 'FTW')).not.toContain 'fun = ->'

      expect(foo_litcoffee_hbs_us.render(option: on, title: off)).toContain 'fun = ->'
      expect(foo_litcoffee_hbs_us.render(option: on, title: off)).not.toContain '# # Untitled'
      expect(foo_litcoffee_hbs_us.render(option: on, title: off)).not.toContain 'class Klass'

    foo_js_hbs_jade_us = tarima.parse 'foo.js.hbs.jade.us', '''
      h1 <%= title || 'Untitled' %>

      |{{#option}}
      div I am a div
      |{{/option}}{{^option}}
      span I am a span
      |{{/option}}

      div.nested
        {{#option}}
        span {{option}}
        {{/option}}
    '''

    xit 'foo.js.hbs.jade.us -- render() should apply a hack for those-ugly-pipes', ->
      expect(foo_js_hbs_jade_us.render(title: off, option: on)).toContain '<div class="nested"><span>true</span></div>'

    it 'foo.js.hbs.jade.us -- render() should produce modified jade-code as markup', ->
      expect(foo_js_hbs_jade_us.render(title: off, option: off)).toContain '<h1>Untitled</h1><span>I am a span</span>'

    it 'foo.js.hbs.jade.us -- compile() should produce executable javascript from hbs-code', ->
      expect(foo_js_hbs_jade_us.compile(title: off, option: off)).toContain 'Handlebars.template'

    foo_html_jade_us = tarima.parse 'foo.html.jade.us', '''
      body.
        <%= value %>
    '''

    it 'foo.html.jade.us -- render() should produce modified jade-code as markup', ->
      expect(foo_html_jade_us.render(value: 'OK')).toBe '<body>OK</body>'

    it 'foo.html.jade.us -- compile() should produce modified jade-code as markup', ->
      expect(foo_html_jade_us.compile(value: 'OK')).toBe '<body>OK</body>'
