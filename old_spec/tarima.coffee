fs = require('fs')
path = require('path')
tarima = require('../lib')

module.exports = (filename, params, code) ->
  return tarima.bundle(arguments...) if Array.isArray(filename)

  [code, params] = [params, code or {}] if typeof params is 'string'

  test_file = path.join(__dirname, 'fixtures', filename)

  if fs.existsSync(test_file)
    tarima.load test_file, params
  else
    tarima.parse filename, code, params

module.exports.engines = tarima.engines
module.exports.util = tarima.util
