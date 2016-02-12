describe 'globals support', ->
  it 'should allow injection of static values', (done) ->
    data =
      globals:
        foo: 'bar'

    tarima('script.js', 'alert(foo)', data).render  (err, result) ->
      expect(err).toBeUndefined()
      expect(result.code).toContain 'function(foo)'
      expect(result.code).toContain '.call(this,"bar")'
      done()
