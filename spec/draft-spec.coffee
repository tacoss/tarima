describe 'next-draft', ->
  it 'should render jade templates',
    test ['x.jade', 'h1 OK'], (result) ->
      expect(result.code).toContain '<h1>OK</h1>'
      expect(result.ext).toEqual 'html'

  it 'should render ractive templates',
    test ['x.ract.jade', 'h1 {{x || "y"}}'], (result) ->
      expect(result.code).toContain '<h1>y</h1>'
      expect(result.ext).toEqual 'html'

  it 'should render coffee-script sources',
    test ['x.litcoffee', 'foo bar'], (result) ->
      expect(result.code).toContain 'foo(bar)'
      expect(result.code).toContain '.call(this)'
      expect(result.ext).toEqual 'js'

  it 'should allow many mixins, e.g. .md.hbs.ejs',
    test ['x.md.hbs.ejs', '# {{<%= x %>}}'], (result) ->
      expect(result.code).toContain '<h1 id="z">z</h1>'
      expect(result.ext).toEqual 'html'
    , {
        x: 'y'
        y: 'z'
      }

  it 'should render less stylesheets',
    test ['x.less', '&*{x:y}'], (result) ->
      expect(result.code).toContain '''
        * {
          x: y;
        }
      '''
      expect(result.ext).toEqual 'css'
