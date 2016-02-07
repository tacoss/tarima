tarima = require('./tarima-helpers')

describe '_render support', ->
  it '...', (done) ->
    data =
      _render: '_layout.jade'

    tarima('page.jade').render data, (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<div><h1>It works!</h1></div>'
      expect(result.locals).toEqual yield: '<h1>It works!</h1>'
      #expect(result.required).toEqual [tarima.fixture('_layout.jade')]
      done()
