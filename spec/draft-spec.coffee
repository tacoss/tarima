tarima = require('../lib')

describe 'next-draft', ->
  it 'x.jade', (done) ->
    tarima.render 'x.jade', 'h1 OK', (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<h1>OK</h1>'
      done()

  it 'x.ract.jade', (done) ->
    tarima.render 'x.ract.jade', 'h1 {{x || "y"}}', (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<h1>y</h1>'
      done()
