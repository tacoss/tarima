__ = 'IMPLEMENT THIS'


validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


tpl_js_litcoffee = tarimaFixtures('tpl_js_litcoffee')

describe 'foo.js.litcoffee', ->
  it 'it should work for literate coffe too (coffe-engine, ...)', ->
    expect(-> validateEngine('coffee').pass tpl_js_litcoffee.partial.compile(tpl_js_litcoffee.params)).not.toThrow()
    expect(-> validateEngine('coffee').pass tpl_js_litcoffee.partial.render(tpl_js_litcoffee.params)).not.toThrow()

describe 'foo.js.coffee.md', ->
  it 'it should work for literate coffe too (coffe-engine, ...)', ->
    tpl_js_coffee_md = tpl_js_litcoffee.partial.override 'foo.js.coffee.md'

    expect(-> validateEngine('coffee').pass tpl_js_coffee_md.compile(tpl_js_litcoffee.params)).not.toThrow()
    expect(-> validateEngine('coffee').pass tpl_js_coffee_md.render(tpl_js_litcoffee.params)).not.toThrow()
