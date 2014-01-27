
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')

foo_js_jade = tarimaFixtures('foo_js_jade')

describe 'foo.js.jade', ->
  it 'should return compiled jade-code into js-code using compile()', ->
    expect(-> validateEngine('jade').pass foo_js_jade.partial.compile(foo_js_jade.params)).not.toThrow()

  it 'should return executed jade-code into html-markup using render()', ->
    expect(foo_js_jade.partial.render(foo_js_jade.params)).toContain foo_js_jade.contain

describe 'foo.js.js.jade', ->
  foo_js_js_jade = foo_js_jade.partial.override('foo.js.js.jade')

  it 'should throw error due invalid js-code using compile() and render()', ->
    expect(-> foo_js_js_jade.compile()).toThrow()
    expect(-> foo_js_js_jade.render()).toThrow()

describe 'foo.js.jade.js', ->
  foo_js_jade_js = foo_js_jade.partial.override('foo.js.jade.js')

  it 'should validate plain js-code integrity (jade)', ->
    expect(-> validateEngine('jade').pass foo_js_jade_js.compile()).not.toThrow()
    expect(-> foo_js_jade_js.render()).not.toThrow()

  it 'would return weird html-markup (js-engine, jade-engine, boom!)', ->
    expect(foo_js_jade_js.render()).toContain '<function>anonymous'
    expect(foo_js_jade_js.render()).toContain '</function>'
    expect(foo_js_jade_js.render()).toContain '</with>'
