fs = require('fs')
path = require('path')
tarima = require('../lib')

global.bundle = tarima.bundle
global.cmd = require('./helpers/cmd')
global.read = require('./helpers/read')
global.write = require('./helpers/write')
global.exists = require('./helpers/exists')
global.unlink = require('./helpers/unlink');
global.rmdir = require('./helpers/rmdir');

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

  if global.exists(test_file)
    tarima.load test_file, opts
  else
    tarima.parse filename, source, opts

global.test = (args, cb, locals) ->
  global.it args[0], (done) ->
    global.tarima(args...).render locals, (err, result) ->
      if err
        console.log(args)
        console.log(err.stack || err.message)
        return done()

      expect(err).toBeUndefined()

      try
        cb(result)
      catch e
        console.log e

      done()
