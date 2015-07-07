tarima = require('../lib')

module.exports = (filename, params, code) ->
  [code, params] = [params, {}] if typeof params is 'string'
  tarima.parse filename, code, params
