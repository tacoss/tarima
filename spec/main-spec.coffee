describe 'Tarima', ->
  tarima = require('../lib/tarima')

  it 'should parse inline templates', ->
    inline_tpl = '''
    h1 I'm a template
    p: span: <%= WUT %>
    '''

    inline_test = tarima.parse 'index.js.us.jade', inline_tpl

    expect(typeof inline_test).toBe 'function'
    expect(typeof inline_test()).toBe 'function'

    expect(inline_test()).toThrow()
    expect(inline_test()(WUT: 'WUUUUUTZ')).toBe '''
    <h1>I'm a template</h1><p><span>WUUUUUTZ</span></p>
    '''

  it 'should load file-based templates', ->
    fs_test = tarima.load "#{__dirname}/samples/test.json.hbs.us"

    expect(typeof fs_test).toBe 'function'
    expect(typeof fs_test(object: 'xy')).toBe 'function'

    data = [
      { key: 'foo', value: 'bar' }
      { key: 'candy', value: 'does' }
    ]

    json = fs_test(object: 'ab')(items: data)

    expect(JSON.parse(json).ab).toEqual { foo: 'bar', candy: 'does' }

  it 'should expose template params and source', ->
    code_test = tarima.parse 'test.js.ract', '''
    <ul>
    {{#items}}
      <li>{{value}}</li>
    {{/items}}
    </ul>
    '''

    partial = code_test()

    expect(partial.params.filepath).toBe 'test.js.ract'
    expect(partial.params.name).toBe 'test'
    expect(partial.params.ext).toBe 'js'

    expect(partial.source).toBe '''
    [{t:7,e:"ul",f:[{t:4,r:"items",f:[" ",{t:7,e:"li",f:[{t:2,r:"value"}]}," "]}]}]
    '''

  describe 'Engines', ->
    data =
      foo: 'bar'
      candy: ['does', 'nothing']
      baz: {  buzz: 'bazzinga', x: 'y' }

    it 'should parse EJS', ->
      expect(tarima.parse('test.js.ejs', '<%= foo %>')()(data)).toBe 'bar'

    it 'should parse ECO', ->
      expect(tarima.parse('test.js.eco', '''
        <% for @item in @candy: %>- <%= @item %>
        <% end %>
      ''')()(data)).toBe '''
      - does
      - nothing

      '''

    it 'should parse LESS', ->
      expect(tarima.parse('test.css.less', '.foo { .candy { bar: does nothing; } }')()).toBe '''
      .foo .candy {
        bar: does nothing;
      }

      '''

    it 'should parse Ractive', ->
      expect(tarima.parse('test.json.ract', '{{foo}}')(data)[0].r).toBe 'foo'

    it 'should parse CoffeeScript', ->
      expect(tarima.parse('test.js.coffee', 'foo = -> bar')()).toBe '''
      var foo;

      foo = function() {
        return bar;
      };

      '''

    it 'should parse Jade', ->
      expect(tarima.parse('test.html.jade', '''
        ul
          each val, key in baz
            li #{key}: #{val}
      ''', client: off)()(data)).toBe '''
      <ul><li>buzz: bazzinga</li><li>x: y</li></ul>
      '''

    it 'should parse Handlebars', ->
      expect(tarima.parse('test.js.hbs', "{{baz.buzz}}")()(data)).toBe 'bazzinga'

    it 'should parse Underscore (using lodash)', ->
      expect(tarima.parse('test.js.us', '''
        <% for (var item in candy) { %>- <%= candy[item] %>
        <% } %>
      ''')()(data)).toBe '''
      - does
      - nothing

      '''
