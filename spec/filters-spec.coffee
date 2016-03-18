describe 'filters support', ->
  it 'should allow some pre-filters',
    test ['x.pug', 'x y', filter: (partial) -> partial.source += '\nz'], (result) ->
      expect(result.source).toContain '<x>y</x><z></z>'

  it 'should allow many pre-filters',
    test ['x.pug', 'x y', filter: [(partial) -> partial.source += '\nz']], (result) ->
      expect(result.source).toContain '<x>y</x><z></z>'
