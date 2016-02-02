tarima = require('./tarima-helpers')

describe 'next-draft', ->
  it 'x.jade', (done) ->
    tarima('x.jade', 'h1 OK').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<h1>OK</h1>'
      done()

  it 'x.ract.jade', (done) ->
    tarima('x.ract.jade', 'h1 {{x || "y"}}').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<h1>y</h1>'
      done()
