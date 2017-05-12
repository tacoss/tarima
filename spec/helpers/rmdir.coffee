path = require('path')
rimraf = require('rimraf')

module.exports = (filepath) ->
  rimraf.sync(path.join(__dirname, '../fixtures', filepath))
