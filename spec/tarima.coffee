fs = require('fs')
path = require('path')
tarima = require('../lib')

module.exports = (filename, params, code) ->
  [code, params] = [params, {}] if typeof params is 'string'

  return tarima.bundle(filename) if Array.isArray(filename)

  test_file = path.join(__dirname, 'fixtures', filename)

  if fs.existsSync(test_file)
    tarima.load test_file, params
  else
    tarima.parse filename, code, params
