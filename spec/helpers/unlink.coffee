fs = require('fs')
path = require('path')
exists = require('./exists')
rimraf = require('rimraf')

module.exports = (file) ->
  file = path.join(__dirname, '../fixtures', file)
  rimraf.sync(file) if exists(file)
