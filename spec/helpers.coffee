fs = require('fs')
path = require('path')
tarima = require('../lib')

global.fixture = (filename) ->
  path.join(__dirname, 'fixtures', filename)

global.tarima = (filename, source, opts, cb) ->
  if typeof source isnt 'string'
    opts = source
    source = ''

  if typeof opts is 'function'
    cb = opts
    opts = {}

  test_file = fixture(filename)

  if fs.existsSync(test_file)
    tarima.load test_file, opts
  else
    tarima.parse filename, source, opts

global.test = (args, cb, locals) ->
  (done) ->
    global.tarima(args...).render locals, (err, result) ->
      console.log(err.stack) if err
      expect(err).toBeUndefined()
      cb(result)
      done()

global.bundle = tarima.bundle
global.support = tarima.support
