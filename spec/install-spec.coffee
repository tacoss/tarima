j = require('path').join
rm = require('rimraf').sync

describe 'install support', ->
  it 'should allow dynamic module installation', (done) ->
    rm j(__dirname, '../node_modules/jade')
    tarima('x.jade', 'h1 OK').render (err, result) ->
      expect(err).tobeUndefined()
      expect(result.code).toContain '<h1>OK</h1>'
      done()
