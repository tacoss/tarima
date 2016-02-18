describe 'next-draft', ->
  it 'should render jade templates',
    test ['x.jade', 'h1 OK'], (result) ->
      expect(result.code).toContain '<h1>OK</h1>'

  it 'should render ractive templates',
    test ['x.ract.jade', 'h1 {{x || "y"}}'], (result) ->
      expect(result.code).toContain '<h1>y</h1>'

  it 'should render coffee-script sources',
    test ['x.litcoffee', 'foo bar'], (result) ->
      expect(result.code).toContain 'foo(bar)'
      expect(result.code).toContain '.call(this)'

  it 'should allow crazy mixins, e.g. .md.hbs.ejs',
    test ['x.md.hbs.ejs', '# {{<%= x %>}}'], (result) ->
      expect(result.code).toContain '<h1 id="z">z</h1>'
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
