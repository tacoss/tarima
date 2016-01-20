'use strict';

var path = require('path');

function strPad(text, max) {
  return ('    ' + text).substr(-(max + 1));
}

function errMark(params) {
  var debug = [];

  if (params.message.indexOf(params.filename) === -1) {
    debug.push(params.filename + (typeof params.linenum !== 'undefined' ? ':' + params.linenum : ''));
  }

  if (params.extract) {
    if (typeof params.linenum !== 'undefined') {
      var lines = params.extract.split('\n'),
          max = (params.linenum + lines.length).toString().length;

      debug.push(lines.map(function(line, num) {
        num += 1;

        return '  ' + (num === params.linenum ? '>' : ' ')
          + strPad(num, max)
          + '| ' + line;
      }).join('\n'));

      debug.push('\n' + params.message);
    } else {
      debug.push(params.extract);
    }
  } else {
    debug.push(params.message.replace(/^.*:(?!\d)/, '').trim());
  }

  return debug.join('\n');
}

function isDefined(value) {
  return typeof value !== 'undefined';
}

function getExtract(code, line) {
  line = Math.max(0, line - 5);

  return code.split('\n').slice(line, line + 5).join('\n');
}

module.exports = function(err, params) {
  var fixedError = new Error(),
      fixedFile = path.join(params.filepath, params.filename);

  if (err.lexer) {
    fixedError.message = errMark({
      filename: fixedFile,
      message: (err.message || err.toString()).replace(/^\[\d+:\d+\]\s+/, ''),
      extract: getExtract(params.source, err.lexer.yylineno + 1),
      linenum: err.lexer.yylineno + 1
    });
  } else if (err.shortMessage) {
    fixedError.message = errMark({
      filename: fixedFile,
      message: err.shortMessage,
      extract: getExtract(params.source, err.line),
      linenum: err.line
    });
  } else {
    fixedError.message = errMark({
      filename: err.filename || err.path || fixedFile,
      message: (err.message || err.reason || err.toString()).trim(),
      extract: err.extract ? err.extract.filter(isDefined).join('\n')
        : err.code || err.source || getExtract(params.source, err.line),
      linenum: err.location ? err.location.first_line + 1 : err.line
    });
  }

  fixedError.stack = err.stack;

  return fixedError;
};
