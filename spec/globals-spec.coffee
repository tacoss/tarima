describe 'globals support', ->
  it 'should allow injection of static values', (done) ->
    data =
      globals:
        foo: 'bar'

    tarima('script.js', 'alert(foo)', data).render  (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toContain 'function(foo)'
      expect(result.source).toContain '.call(this,"bar")'
      done()
