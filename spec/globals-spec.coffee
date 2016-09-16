describe 'globals support', ->
  it 'should allow injection of static values', (done) ->
    data =
      globals:
        foo: 'bar'
        candy: ->
          JSON.stringify baz: 'buzz'

    tarima('script.js', '/* global foo, candy */\nalert(foo)', data).render  (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toContain 'var foo = "bar",'
      expect(result.source).toContain 'candy = {"baz":"buzz"};'
      done()
