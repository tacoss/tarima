describe '_render support', ->
  it 'should allow additional rendering with dependency-tracking', (done) ->
    tarima('page.pug').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toMatch /<div>[\s\S]+?<\/div>/
      expect(result.source).toContain '<h1>It works!</h1>'
      expect(result.deps).toContain fixture('_layout.pug')
      expect(result.deps).toContain fixture('_template.pug')
      done()
