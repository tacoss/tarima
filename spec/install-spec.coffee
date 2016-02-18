j = require('path').join
rm = require('rimraf').sync

describe 'install support', ->
  beforeEach ->
    rm j(__dirname, '../node_modules/jade')

  it 'should allow dynamic module installation', (done) ->
    tarima('x.jade', 'h1 OK').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toContain '<h1>OK</h1>'
      done()
