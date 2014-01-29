
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


foo_hbs = tarimaFixtures('foo_hbs')
foo_js_hbs = tarimaFixtures('foo_js_hbs')
foo_html_hbs = foo_js_hbs.partial.override 'foo.html.hbs'

describe 'foo.js.jade.hbs.us', ->
  foo_js_jade_hbs_us = foo_hbs.partial.override 'foo.js.jade.hbs.us'

  it 'compile() and render() would produce jade-code executable into js-code (us-engine, hbs-engine, jade to js, ...)', ->
    expect(-> validateEngine('jade').pass foo_js_jade_hbs_us.compile(foo_hbs.params)).not.toThrow()
    expect(-> validateEngine('jade').pass foo_js_jade_hbs_us.render(foo_hbs.params)).not.toThrow()

    expect(foo_js_jade_hbs_us.compile(foo_hbs.params)).toContain '</no2>'
    expect(foo_js_jade_hbs_us.render(foo_hbs.params)).toContain '</li><li>'

describe 'foo.js.jade.us.hbs', ->
  foo_js_jade_us_hbs = foo_hbs.partial.override 'foo.js.jade.us.hbs'

  it 'compile() and render() would produce jade-code executable into js-code (hbs-engine, us-engine, jade to js, ...)', ->
    expect(-> validateEngine('jade').pass foo_js_jade_us_hbs.compile(foo_hbs.params)).not.toThrow()
    expect(-> validateEngine('jade').pass foo_js_jade_us_hbs.render(foo_hbs.params)).not.toThrow()

describe 'foo.html.hbs', ->
  it 'using compile() and render() should return html-code (hbs-engine, ...)', ->
    expect(foo_html_hbs.compile(foo_js_hbs.params)).toContain '  li'
    expect(foo_html_hbs.render(foo_js_hbs.params)).toContain '1\n'
