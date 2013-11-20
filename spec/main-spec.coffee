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
