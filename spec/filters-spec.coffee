# describe 'filters support', ->
#   it 'should allow some preRender filters',
#     test ['x.pug', 'x y', preRender: (partial) -> partial.source += '\nz'], (result) ->
#       expect(result.source).toContain '<x>y</x>'
#       expect(result.source).toContain '<z></z>'

#   it 'should allow many preRender filters',
#     test ['x.pug', 'x y', preRender: [(partial) -> partial.source += '\nz']], (result) ->
#       expect(result.source).toContain '<x>y</x>'
#       expect(result.source).toContain '<z></z>'

#   it 'should allow some postRender filters',
#     test ['x.pug', 'x y', postRender: (partial) -> partial.source = '<!--' + partial.source.trim() + '-->'], (result) ->
#       expect(result.source).toEqual '<!--<x>y</x>-->'

#   it 'should allow many postRender filters',
#     test ['x.pug', 'x y', postRender: [(partial) -> partial.source = '<!--' + partial.source.trim() + '-->']], (result) ->
#       expect(result.source).toEqual '<!--<x>y</x>-->'
