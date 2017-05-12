fs = require('fs')
path = require('path')
exists = require('./exists')

module.exports = (filepath) ->
  filepath = path.join(__dirname, '../fixtures', filepath)
  fs.readFileSync(filepath).toString() if exists(filepath)
