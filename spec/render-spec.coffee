tarima = require('./tarima-helpers')

describe '_render support', ->
  it '...', (done) ->
    data =
      _render: '_layout.jade'

    tarima('page.jade').render data, (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<div><h1>It works!</h1></div>'
      expect(result.required).toEqual [
        tarima.fixture('_layout.jade')
        tarima.fixture('_template.jade')
      ]
      done()
