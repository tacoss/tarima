__ = 'IMPLEMENT THIS'


validateEngine = require('../validate-engines')
tarimaFixtures = require('../tarima-fixtures')


describe 'foo.jade', ->
  it 'should return as is (regular jade-file)', ->
    js_foo = tarimaFixtures('js_foo')

    expect(js_foo.partial.compile(js_foo.params)).toBe js_foo.source
    expect(js_foo.partial.render(js_foo.params)).toBe js_foo.source
