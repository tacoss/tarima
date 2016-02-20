describe '_render support', ->
  it 'should allow additional rendering with dependency-tracking', (done) ->
    tarima('page.jade').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toMatch /<div>[\s\S]+?<\/div>/
      expect(result.code).toContain '<h1>It works!</h1>'
      expect(result.track).toContain fixture('_layout.jade')
      expect(result.track).toContain fixture('_template.jade')
      done()
