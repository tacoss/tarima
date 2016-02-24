describe 'front-matter support', ->
  it 'should export its data merged with locals', (done) ->
    data =
      a: 1

    tarima('x.jade', '''
      //-
        ---
        c: 2
        ---
      |#{a + c}
    ''').render data, (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toContain 3
      done()

  it 'should support !include tags for locals', (done) ->
    tarima('with_include_tags.jade').render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.locals).toEqual
        foo:
          baz: 'buzz'
      done()
