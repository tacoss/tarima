
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')

foo_js_us = tarimaFixtures('foo_js_us')
foo_html_us = foo_js_us.partial.override 'foo.html.us'

describe 'foo.html.us', ->
  it 'using compile() and render() should return html-code (us-engine, ...)', ->
    expect(foo_html_us.compile(foo_js_us.params)).toContain 'fuu!'
    expect(foo_html_us.render(foo_js_us.params)).toContain '{{/candy}}'
