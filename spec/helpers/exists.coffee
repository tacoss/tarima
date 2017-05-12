fs = require('fs')

module.exports = (file) ->
  try
    fs.statSync(file).isFile()
  catch e
    false
