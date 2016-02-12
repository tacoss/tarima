describe '_render support', ->
  it 'should allow additional rendering with dependency-tracking', (done) ->
    data =
      _render: '_layout.jade'

    tarima('page.jade').render data, (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toEqual '<div><h1>It works!</h1></div>'
      expect(result.required).toContain fixture('_layout.jade')
      expect(result.required).toContain fixture('_template.jade')
      done()
