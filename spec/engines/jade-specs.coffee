
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')

foo_js_jade = tarimaFixtures('foo_js_jade')

describe 'foo.js.js.jade', ->
  foo_js_js_jade = foo_js_jade.partial.override('foo.js.js.jade')

  it 'using compile() and render() would return precompiled js-code (jade into js, ...)', ->
    expect(-> validateEngine('jade').pass foo_js_js_jade.compile(foo_js_jade.params)).not.toThrow()
    expect(-> validateEngine('jade').pass foo_js_js_jade.render(foo_js_jade.params)).not.toThrow()

describe 'foo.js.jade.js', ->
  foo_js_jade_js = foo_js_jade.partial.override('foo.js.jade.js')

  it 'using compile() and render() would return precompiled js-code (js-engine, jade into js, ...)', ->
    expect(-> validateEngine('jade').pass foo_js_jade_js.compile(foo_js_jade.params)).not.toThrow()
    expect(-> validateEngine('jade').pass foo_js_jade_js.render(foo_js_jade.params)).not.toThrow()

describe 'foo.html.jade.js', ->
  foo_html_jade_js = foo_js_jade.partial.override('foo.html.jade.js')

  it 'using render() would return html-markup (js-engine, jade into js, jade into html, ...)', ->
    expect(foo_html_jade_js.render(foo_js_jade.params)).toBe '<h1></h1><p></p>'

  it 'using compile() would return jade-code precompiled into js-code (js-engine, jade-engine, jade into js, ...)', ->
    expect(-> validateEngine('jade').pass foo_html_jade_js.compile(foo_js_jade.params)).not.toThrow()
    #expect(-> validateEngine('html').pass foo_html_jade_js.render(foo_js_jade.params)).not.toThrow()
