# describe 'front-matter support', ->
#   it 'should export its data merged with locals', (done) ->
#     data =
#       a: 1

#     tarima('x.pug', '''
#       //-
#         ---
#         c: 2
#         ---
#       |#{a + c}
#     ''').render data, (err, result) ->
#       expect(err).toBeUndefined()
#       expect(result.source).toContain 3
#       done()

#   it 'should support !include tags for locals', (done) ->
#     tarima('with_include_tags.pug').render (err, result) ->
#       expect(err).toBeUndefined()
#       # use JSON.stringify() due identity issues with IncludedFile objects
#       expect(JSON.stringify result.locals).toEqual JSON.stringify
#         foo:
#           baz: 'buzz'
#       done()
