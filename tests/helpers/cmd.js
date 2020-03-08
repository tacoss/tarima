const path = require('path');
const exec = require('child_process').exec;

process.chdir(path.join(__dirname, '../fixtures'));

const execCommand = (cmd, _cwd, callback) => {
  execCommand.stderr = null;
  execCommand.stdout = null;
  execCommand.exitStatus = null;

  let cli = [path.join(__dirname, '../../bin/cli.js')];
  let cwd = process.cwd();

  if (typeof _cwd === 'string') {
    cwd = _cwd;
  } else {
    callback = _cwd;
  }

  if (typeof cmd === 'function') {
    callback = cmd;
  } else {
    cli.push(cmd);
  }

  cli = exec(cli.join(' '), { cwd }, (error, out, err) => {
    execCommand.stdout = out;
    execCommand.stderr = err;

    if ((error != null ? error.code : void 0) != null) {
      execCommand.exitStatus = error.code;
    }

    callback();
  });

  cli.on('close', code => {
    execCommand.exitStatus = code;
  });
};

module.exports = execCommand;
