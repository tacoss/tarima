__ = 'IMPLEMENT THIS'


validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


foo_hbs = tarimaFixtures('foo_hbs')


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
