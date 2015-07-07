$ = require('./tarima')

describe 'include/import support', ->
  it 'should resolve includes from home.html.jade', ->
    expect($('home.html.jade').render()).toContain '<h1>OSOM!</h1>'

  it 'should resolve includes from page.html.ejs', ->
    expect($('page.html.ejs').render()).toContain '<span>:D</span>'

  it 'should resolve imports from style.css.less', ->
    expect($('style.css.less').render()).toContain 'color: red'
