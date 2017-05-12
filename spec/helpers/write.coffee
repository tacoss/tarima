fs = require('fs')
path = require('path')
exists = require('./exists')

module.exports = (file, content) ->
  file = path.join(__dirname, '../fixtures', file)
  fs.writeFileSync(file, content)
