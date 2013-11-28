describe 'Tarima', ->
  tarima = require('../lib/tarima')

  it 'should parse inline templates', ->
    inline_tpl = '''
    h1 I'm a template
    p: span: <%= WUT %>
    '''

    inline_test = tarima.parse 'index.js.us.jade', inline_tpl

    expect(typeof inline_test).toBe 'object'
    expect(typeof inline_test.compile).toBe 'function'
    expect(typeof inline_test.toSource).toBe 'function'

    expect(-> inline_test.compile()).toThrow()
    expect(inline_test.compile(WUT: 'WUUUUUTZ')).toBe '''
    <h1>I'm a template</h1><p><span>WUUUUUTZ</span></p>
    '''

  it 'should load file-based templates', ->
    fs_test = tarima.load "#{__dirname}/samples/test.json.hbs.us"

    expect(typeof fs_test).toBe 'object'
    expect(typeof fs_test.compile).toBe 'function'
    expect(typeof fs_test.toSource).toBe 'function'

    data = [
      { key: 'foo', value: 'bar' }
      { key: 'candy', value: 'does' }
    ]

    json = fs_test.compile(object: 'ab', items: data)

    expect(JSON.parse(json).ab).toEqual { foo: 'bar', candy: 'does' }

  it 'should expose template params and source', ->
    code_test = tarima.parse 'test.js.ract', '''
    <ul>
    {{#items}}
      <li>{{value}}</li>
    {{/items}}
    </ul>
    '''

    expect(code_test.params.filename).toBe 'test.js.ract'
    expect(code_test.params.filepath).toBe ''
    expect(code_test.params.name).toBe 'test'
    expect(code_test.params.ext).toBe 'js'

    expect(code_test.toSource()).toBe '''
    [{t:7,e:"ul",f:[{t:4,r:"items",f:[" ",{t:7,e:"li",f:[{t:2,r:"value"}]}," "]}]}]
    '''

  describe 'Engines', ->
    data =
      foo: 'bar'
      candy: ['does', 'nothing']
      baz: {  buzz: 'bazzinga', x: 'y' }

    it 'should parse EJS', ->
      ejs_test = tarima.parse 'test.js.ejs', '<%= foo %>'

      expect(ejs_test.compile(data)).toBe 'bar'

    it 'should parse ECO', ->
      eco_test = tarima.parse 'test.js.eco', '''
        <% for @item in @candy: %>- <%= @item %>
        <% end %>
      '''

      expect(eco_test.compile(data)).toBe '''
      - does
      - nothing

      '''

    it 'should parse LESS', ->
      less_test = tarima.parse('test.css.less', '.foo { .candy { bar: does nothing; } }')

      expect(less_test.compile()).toBe '''
      .foo .candy {
        bar: does nothing;
      }

      '''

    it 'should parse Ractive', ->
      ract_test = tarima.parse('test.json.ract', '{{foo}}')

      expect(ract_test.compile(data)[0].r).toBe 'foo'

    it 'should parse CoffeeScript', ->
      coffee_test = tarima.parse 'test.js.coffee', 'foo = -> bar'

      expect(coffee_test.compile()).toBe '''
      var foo;

      foo = function() {
        return bar;
      };

      '''

    it 'should parse Jade', ->
      jade_test = tarima.parse 'test.html.jade', '''
        ul
          each val, key in baz
            li #{key}: #{val}
      '''

      expect(jade_test.compile(data)).toBe '''
      <ul><li>buzz: bazzinga</li><li>x: y</li></ul>
      '''

      expect(jade_test.toSource()).not.toBe 'false'
      expect(~jade_test.toSource().indexOf('return fn(locals')).toBeFalsy()
      expect(~jade_test.toSource().indexOf('function anonymous')).not.toBeFalsy()

    it 'should parse Handlebars', ->
      hbs_test = tarima.parse 'test.js.hbs', "{{baz.buzz}}"

      expect(hbs_test.compile(data)).toBe 'bazzinga'
      expect(~hbs_test.toSource().indexOf('function (Handlebars')).not.toBeFalsy()
      expect(~hbs_test.toSource().indexOf('compiled = compileInput();')).toBeFalsy()

    it 'should parse Underscore (using lodash)', ->
      us_test = tarima.parse 'test.js.us', '''
        <% for (var item in candy) { %>- <%= candy[item] %>
        <% } %>
      '''

      expect(us_test.compile(data)).toBe '''
      - does
      - nothing

      '''
