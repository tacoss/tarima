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
    it 'foo.litcoffee.hbs.ejs -- render() should produce modified coffee-code as is', ->
      foo_litcoffee_hbs_ejs = tarima.parse 'foo.litcoffee.hbs.ejs', '''
        # <%= title || 'Untitled' %>

        {{#option}}
            fun = ->
        {{/option}}{{^option}}
            class Klass; fun = new Klass
        {{/option}}
      '''

      expect(foo_litcoffee_hbs_ejs.render(title: off)).toContain 'class Klass'
      expect(foo_litcoffee_hbs_ejs.compile(title: off)).not.toContain 'Handlebars.template'

      expect(foo_litcoffee_hbs_ejs.render(title: 'FTW')).toContain 'class Klass'
      expect(foo_litcoffee_hbs_ejs.render(title: 'FTW')).not.toContain '# # FTW'
      expect(foo_litcoffee_hbs_ejs.render(title: 'FTW')).not.toContain 'fun = ->'

      expect(foo_litcoffee_hbs_ejs.render(option: on, title: off)).toContain 'fun = ->'
      expect(foo_litcoffee_hbs_ejs.render(option: on, title: off)).not.toContain '# # Untitled'
      expect(foo_litcoffee_hbs_ejs.render(option: on, title: off)).not.toContain 'class Klass'

    foo_js_hbs_jade_ejs = tarima.parse 'foo.js.hbs.jade.ejs', '''
      h1 <%= title || 'Untitled' %>

      |{{#option}}
      div I am a div
      |{{/option}}{{^option}}
      span I am a span
      |{{/option}}
    '''

    it 'foo.js.hbs.jade.ejs -- render() should produce modified jade-code as markup', ->
      expect(foo_js_hbs_jade_ejs.render(title: off, option: off)).toBe '<h1>Untitled</h1><span>I am a span</span>'

    it 'foo.js.hbs.jade.ejs -- compile() should produce executable javascript from hbs-code', ->
      expect(foo_js_hbs_jade_ejs.compile(title: off, option: off)).toContain 'Handlebars.template'

    foo_html_jade_ejs = tarima.parse 'foo.html.jade.ejs', '''
      body.
        <%= value %>
    '''

    it 'foo.html.jade.ejs -- render() should produce modified jade-code as markup', ->
      expect(foo_html_jade_ejs.render(value: 'OK')).toBe '<body>OK</body>'

    it 'foo.html.jade.ejs -- compile() should produce modified jade-code as markup', ->
      expect(foo_html_jade_ejs.compile(value: 'OK')).toBe '<body>OK</body>'

  describe 'front-matter integration', ->
    matrix =
      '.js.jade': v: '#{x}', r: '<y></y>'
      '.html.ract': v: '{{x}}', r: 'y'
      '.html.hbs.md': v: '{{x}}', r: '<p>y</p>'
      '.html.ejs': v: '<%=x%>', r: 'y'

    Object.keys(matrix).forEach (key) ->
      set = matrix[key]

      it "should provide data from #{key}", ->
        view_tpl = tarima.parse "view_tpl#{key}", """
          ---
          x: y
          ---
          #{set.v}
        """

        expect(view_tpl.render()).toContain set.r
        expect(view_tpl.params.options.data).toEqual x: 'y'
