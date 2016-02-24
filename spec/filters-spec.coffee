describe 'filters support', ->
  it 'should allow some pre-filters', (done) ->
    data =
      filter: (partial) ->
        partial.source += '\nz'

    tarima('x.jade', 'x y', data).render (err, result) ->
      expect(err).toBeUndefined()
      expect(result.source).toContain '<x>y</x><z></z>'
      done()
