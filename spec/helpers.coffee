fs = require('fs')
path = require('path')
tarima = require('../lib')

exists = (file) ->
  try
    fs.statSync(file).isFile()
  catch e
    false

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

  if exists(test_file)
    tarima.load test_file, opts
  else
    tarima.parse filename, source, opts

global.test = (args, cb, locals) ->
  global.it args[0], (done) ->
    global.tarima(args...).render locals, (err, result) ->
      if err
        console.log(args)
        console.log(err.stack)
        return done()

      expect(err).toBeUndefined()

      try
        cb(result)
      catch e
        console.log e

      done()

global.bundle = tarima.bundle
