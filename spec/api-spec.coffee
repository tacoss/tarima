$ = require('./tarima')

describe 'defined api', ->
  describe 'engines()', ->
    it 'should return all registered extensions', ->
      expect($.engines).not.toThrow()

  describe 'common options', ->
    it 'should be allowed to alter partials if options.filter is given', ->
      options =
        filter: (params) ->
          params.source = '@value: cyan;\n' + params.source

      view = $('x.y.less', '.test { color: @value; }', options)

      expect(view.render()).toContain 'color: cyan'

    it 'should return relative keypaths if options.cwd is given', ->
      expect($('foo/bar/baz.buzz').params.keypath).toBe 'baz'
      expect($('foo/bar/baz.buzz', cwd: 'foo').params.keypath).toBe 'bar/baz'

    it 'should override <engine>-params if options.<engine> is given', ->
      params =
        coffee:
          bare: false

      code = $('x.js.coffee', 'foo bar', params).compile()

      expect(code).toContain 'foo(bar)'
      expect(code).toContain '.call(this)'

  describe 'handling exceptions', ->
    it 'should not shallow thrown exceptions', ->
      expect(-> $('x.js.less', '*{color red}').render()).toThrow()
