const path = require('path');
const exec = require('child_process').exec;

process.chdir(path.join(__dirname, '../fixtures'));

const execCommand = (cmd, callback) => {
  execCommand.stderr = null;
  execCommand.stdout = null;
  execCommand.exitStatus = null;

  let cli = [path.join(__dirname, '../../bin/tarima')];

  if (typeof cmd === 'function') {
    callback = cmd;
  } else {
    cli.push(cmd);
  }

  cli = exec(cli.join(' '), (error, out, err) => {
    execCommand.stdout = out;
    execCommand.stderr = err;

    if ((error != null ? error.code : void 0) != null) {
      execCommand.exitStatus = error.code;
    }

    callback();
  });

  const exitEventName = process.version.split('.')[1] === '6' ? 'exit' : 'close';

  cli.on(exitEventName, code => {
    execCommand.exitStatus = code;
  });
};

module.exports = execCommand;
