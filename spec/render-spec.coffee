describe '_render support', ->
  it 'should allow additional rendering with dependency-tracking', (done) ->
    tarima('page.jade').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /<div>[\s\S]+?<\/div>/
      expect(result.source).toContain '<h1>It works!</h1>'
      expect(result.dependencies).toContain fixture('_layout.jade')
      expect(result.dependencies).toContain fixture('_template.jade')
      done()
