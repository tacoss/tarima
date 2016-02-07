tarima = require('./tarima-helpers')

describe 'front-matter support', ->
  it 'should export its data merged with locals', (done) ->
    data =
      a: 'b'

    tarima('x.jade', '''
      //-
        ---
        c: d
        ---
    ''').render data, (err, result) ->
      expect(err).toBeUndefined()
      expect(result.locals).toEqual
        a: 'b'
        c: 'd'
      done()
