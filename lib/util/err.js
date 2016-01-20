'use strict';

var path = require('path');

function strPad(text, max) {
  return ('    ' + text).substr(-(max + 1));
}

function errMark(params) {
  var debug = [];

  if (params.extract && params.message.indexOf(params.filename) === -1) {
    debug.push(params.filename + (typeof params.linenum !== 'undefined' ? ':' + params.linenum : ''));
  }

  if (params.extract) {
    if (typeof params.linenum !== 'undefined') {
      debug.push(params.extract.split('\n').map(function(line, num) {
        num += 1;

        return '  ' + (num === params.linenum ? '>' : ' ')
          + strPad(num, params.linenum.toString().length)
          + '| ' + line;
      }).join('\n'));

      debug.push('\n' + params.message);
    } else {
      debug.push(params.extract);
    }
  } else {
    debug.push(params.filename + (typeof params.linenum !== 'undefined' ? ':' + params.linenum : '')
      + '\n' + params.message.replace(/^.*:(?!\d)/, '').trim());
  }

  return debug.join('\n');
}

module.exports = function(err, params) {
  var fixedError = new Error();

  fixedError.message = errMark({
    filename: err.mark ? err.mark.name : err.filename || err.path || path.join(params.filepath, params.filename),
    message: (err.message || err.reason || err.toString()).trim(),
    extract: err.extract ? err.extract.join('\n') : err.mark || err.code,
    linenum: err.mark ? err.mark.line : err.location ? err.location.first_line + 1 : err.line,
    column: err.mark ? err.mark.column : err.location ? err.location.first_column : err.column
  });

  fixedError.stack = err.stack;

  return fixedError;
};
