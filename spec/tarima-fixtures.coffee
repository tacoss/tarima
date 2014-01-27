
engines = ['js', 'jade']

grunt = require('grunt')
tarima = require('../lib/tarima')

# dummies
template = {}
template.foo =
  source: 'a:b:c:|{{d||"e=<%=f%>"}}'
  partial: tarima.parse 'foo', '__'
  result: '__'

template.foo_bar =
  source: "pre.\n  " + template.foo.source
  partial: tarima.parse 'foo.bar', "pre.\n  " + template.foo.source
  result: "pre.\n  " + template.foo.source


loadFixtures = (type) ->
  yaml = grunt.file.readYAML "#{__dirname}/fixtures/#{type}-fixtures.yml"
  template[tpl] = props for tpl, props of yaml

loadFixtures(engine) for engine in engines

module.exports = (which) ->
  if source = template[which]
    unless source.partial
      source.partial = tarima.parse which.replace(/_/g, '.'), source.source
    source
