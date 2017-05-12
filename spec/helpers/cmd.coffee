path = require('path')
exec = require('child_process').exec

process.chdir path.join(__dirname, '../fixtures')

execCommand = (cmd, callback) ->
  execCommand.stderr = null
  execCommand.stdout = null
  execCommand.exitStatus = null

  cli = [path.join(__dirname, '../../bin/tarima')]

  if typeof cmd is 'function'
    callback = cmd
  else
    cli.push cmd

  cli = exec cli.join(' '), (error, out, err) ->
    execCommand.stdout = out
    execCommand.stderr = err
    execCommand.exitStatus = error.code if error?.code?
    callback()

  exitEventName = if process.version.split('.')[1] is '6' then 'exit' else 'close'

  cli.on exitEventName, (code) ->
    execCommand.exitStatus = code

module.exports = execCommand
