$ = require('./tarima')

describe 'bundling behavior', ->
  describe 'known dependencies', ->
    it 'should expose dependencies from x.js.jade', ->
      expect($('x.js.jade').params.dependencies).toContain 'jade/runtime'

    it 'should expose dependencies from x.js.hbs', ->
      expect($('x.js.hbs').params.dependencies).toContain 'handlebars/runtime'

    it 'should expose dependencies from x.js.less', ->
      expect($('x.js.less').params.dependencies).toContain 'require("less")'

  describe 'calling bundle()', ->
    views = null

    code = $([
      $('a.js.coffee', '->')
      $('b.js.jade', 'h1= value')
      $('c.js.less', '* { color: @value }')
      $('d.js.hbs', '{{ value }}')
      $('e.js.ejs', '<%= value %>')
    ])

    try eval(code + '; views = JST')
    catch e

    it 'should return a JST object', ->
      expect(Object::toString.call(views)).toBe '[object Object]'

    it 'should return callable functions', ->
      Object.keys(views).forEach (key) ->
        expect(typeof views[key]).toBe 'function'

    it 'should render when calling', ->
      expect(views.b(value: 'OK')).toContain '<h1>OK</h1>'
      expect(views.c(value: 'red')).toContain 'color: red'
      expect(views.d(value: 'OSOM')).toContain 'OSOM'
      expect(views.e(value: '__xD')).toContain '__xD'
