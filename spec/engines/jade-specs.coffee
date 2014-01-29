
validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


foo_js_jade = tarimaFixtures('foo_js_jade')
foo_html_jade = foo_js_jade.partial.override 'foo.html.jade'

describe 'foo.html.jade', ->
  it 'using compile() and render() should return html-code (jade-engine, ...)', ->
    expect(foo_html_jade.compile(foo_js_jade.params)).toContain 'OK'
    expect(foo_html_jade.render(foo_js_jade.params)).toContain '</p>'
