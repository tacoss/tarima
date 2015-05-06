fs = require('fs')
path = require('path')
rmrf = require('rimraf')

cmdexec = require('./cmdexec')

describe 'Tarima as gulp-plugin', ->
  tmp_dir = path.resolve(__dirname, '../tests/tmp')

  read = (file) ->
    fs.readFileSync(path.join(tmp_dir, file)).toString()

  include = (file) ->
    require(path.join(tmp_dir, file))

  beforeEach (done) ->
    process.chdir(path.resolve(__dirname, '../tests'))
    cmdexec([path.resolve(__dirname, '../node_modules/gulp/bin/gulp.js')], done)

  afterEach (done) ->
    rmrf(tmp_dir, done)

  it 'should exit with 0', ->
    expect(cmdexec.exitStatus).toBe 0

  it 'should write raw files', ->
    expect(read('raw/subpath/test.html')).toContain '<so><many><markup>'

  it 'should concatenate many files', ->
    views = include('foo/bar/views.js')
    # expect(is_file()).toBeTruthy()
    console.log views
