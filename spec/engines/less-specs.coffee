
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')

foo_js_less = tarimaFixtures('foo_js_less')
foo_css_less = foo_js_less.partial.override 'foo.css.less'

describe 'foo.css.less', ->
  it 'using compile() and render() should return css-code (less-engine, ...)', ->
    expect(foo_css_less.compile(foo_js_less.params)).toContain 'red'
    expect(foo_css_less.render(foo_js_less.params)).toContain 'red'
