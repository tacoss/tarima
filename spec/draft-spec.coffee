$ = require('./tarima')

describe 'engines behavior', ->
  describe 'render()', ->
    it 'x.y.js should return as is', ->
      expect($('x.y.js', 'var x;').render()).toBe 'var x;'

    it 'x.es6.js should return transpiled ES6', ->
      expect($('x.es6.js', 'const x = "y"').render()).toContain 'var x = "y";'

    it 'x.js.hbs should return rendered Handlebars', ->
      expect($('x.js.hbs', 'x{{y}}').render(y: 'D')).toBe 'xD'

    it 'x.js.ejs should return rendered Embedded JavaScript', ->
      expect($('x.js.ejs', 'a<%=b%>').render(b: '!')).toBe 'a!'

    it 'x.js.coffee should return transpiled CoffeeScript', ->
      expect($('x.js.coffee', 'foo bar').render()).toContain 'foo(bar);'

    it 'x.js.ract should return a plain object (Ractive.js templating)', ->
      expect($('x.js.ract', '{{x}}').render()).toEqual { v: 3, t: [ { t: 2, r: 'x' } ] }

    it 'x.js.jade should return rendered Jade', ->
      expect($('x.js.jade', '|#[#{x}]').render(x: 'y')).toContain '<y></y>'

    it 'x.js.less should return rendered LESS', ->
      expect($('x.js.less', '*{&:_{x:@y}}').render(y: 'z')).toContain '''
        *:_ {
          x: z;
        }
      '''

    it 'x.js.md should return rendered Markdown', ->
      expect($('x.js.md', '# OK').render()).toMatch /<h1[^<>]*>OK<\/h1>/

    it 'x.json.ejs should return raw JSON from rendered EJS', ->
      expect($('x.json.ejs', '{"x":"<%=y%>"}').render(y: 'D')).toBe '{"x":"D"}'

    it 'x.y.ract.jade should return raw HTML from rendered Ractive', ->
      expect($('x.y.ract.jade', 'h1 OK').render()).toContain '<h1>OK</h1>'

  describe 'compile()', ->
    it 'x.js.hbs should return a pre-compiled Handlebars template', ->
      expect($('x.js.hbs', '{{#x}}y{{/x}}').compile(x: 1)).toContain 'Handlebars.template'

    it 'x.js.jade should return a pre-compiled Jade template', ->
      expect($('x.js.jade', 'x=y').compile(y: 'z')).toContain 'function template(locals)'
