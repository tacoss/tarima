
engines = require('./engines')

grunt = require('grunt')
tarima = require('./tarima')

# dummies
template = {}

loadFixtures = (type) ->
  yaml = grunt.file.readYAML "#{__dirname}/fixtures/#{type}-fixtures.yml"
  template[tpl] = props for tpl, props of yaml

loadFixtures(engine) for engine in engines

module.exports = (which) ->
  if source = template[which]
    unless source.partial
      source.partial = tarima.parse which.replace(/_/g, '.'), source.source
    source
