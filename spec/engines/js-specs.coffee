__ = 'IMPLEMENT THIS'


validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


describe 'foo.js', ->
  it 'should return as is (regular js-file)', ->
    js_foo = tarimaFixtures('js_foo')

    expect(js_foo.partial.compile(js_foo.params)).toBe js_foo.source
    expect(js_foo.partial.render(js_foo.params)).toBe js_foo.source

describe 'foo.js.js', ->
  it 'should return js-code precompiled to be called with tpl(locals)', ->
    js_js = tarimaFixtures('js_js')

    expect(-> validateEngine('js').pass(js_js.partial.compile(js_js.params))).not.toThrow()
    expect(-> validateEngine('js').pass(js_js.partial.render(js_js.params))).not.toThrow()
    expect(js_js.partial.compile(js_js.params)).toBe js_js.partial.compile(js_js.params)

describe 'foo.js.js.js', ->
  it 'should precompile templates just one time if demanded (keep calm)', ->
    js_js_js = tarimaFixtures('js_js_js')

    expect(-> validateEngine('js').pass(js_js_js.partial.compile(js_js_js.params))).not.toThrow()
    expect(-> validateEngine('js').pass(js_js_js.partial.render(js_js_js.params))).not.toThrow()
    expect(js_js_js.partial.compile(js_js_js.params)).toBe js_js_js.partial.compile(js_js_js.params)

describe 'foo.js.bar', ->
  it 'should return js-code as is (unknown bar-engine, regular js-file)', ->
    js_bar = tarimaFixtures('js_bar')

    expect(-> validateEngine('js').notPass(js_bar.partial.compile(js_bar.params))).not.toThrow()
    expect(js_bar.partial.render(js_bar.params)).toBe js_bar.result

describe 'tpl.foo.js', ->
  it 'should execute and return from js-code (js-engine, unknown foo-engine)', ->
    js_tpl_foo = tarimaFixtures('js_tpl_foo')

    expect(-> validateEngine('js').pass(js_tpl_foo.partial.compile(js_tpl_foo.params))).not.toThrow()
    expect(js_tpl_foo.partial.render(js_tpl_foo.params)).toBe js_tpl_foo.result

describe 'tpl.foo.js.bar', ->
  it 'should return js-code as is (unknown bar-engine, cancel any further compilation)', ->
    js_tpl_bar = tarimaFixtures('js_tpl_bar')

    expect(-> validateEngine('js').notPass(js_tpl_bar.partial.compile(js_tpl_bar.params))).not.toThrow()
    expect(js_tpl_bar.partial.render(js_tpl_bar.params)).toBe js_tpl_bar.result
