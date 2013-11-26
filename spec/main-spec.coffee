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
