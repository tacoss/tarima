'use strict';

function strPad(text, max) {
  return ('    ' + text).substr(-(max + 1));
}

function errMark(params) {
  var debug = [];

  if (params.message.indexOf(params.filename) === -1) {
    debug.push(params.filename
      + (typeof params.linenum !== 'undefined' ? ':' + params.linenum : '')
      + (typeof params.column !== 'undefined' ? ':' + params.column : '')
      + (params.exception ? ' (' + params.exception + ')' : ''));
  }

  var lines = params.source.split('\n'),
      offset = Math.max(params.linenum - 3, 0);

  params.linenum -= offset;
  params.source = lines.slice(offset, offset + 3).join('\n');

  if (typeof params.linenum !== 'undefined') {
    var lines = params.source.split('\n'),
        max = (params.linenum + lines.length).toString().length;

    var marker = (new Array(params.column + max + 7)).join('-') + '^';

    debug.push(lines.map(function(line, num) {
      num += 1;

      return '  ' + (num === params.linenum ? '>' : ' ')
        + strPad(num + offset, max) + '| ' + line + (num === params.linenum ? '\n' + marker : '');
    }).join('\n'));

    debug.push(params.message[0].toUpperCase() + params.message.substr(1));
  } else {
    debug.push(params.source);
  }

  return debug.join('\n').replace(/^Error:\s+/g, '');
}

module.exports = function(file, error, source, linenum, column) {
  if (typeof file === 'object') {
    if (error.code && error.code.indexOf('PUG:') > -1) {
      return error.toString().replace(/^Error: /, '');
    }

    if (error.extract && error.index) {
      linenum = error.line;
      column = error.column;
    }

    if (error.loc) {
      linenum = error.loc.line;
      column = error.loc.column;
    }

    error = error.message;
    source = file.source;
    file = file.filename;
  }

  var fixedError = new Error(errMark({
    filename: file,
    message: error,
    source: source,
    linenum: linenum,
    column: column
  }));

  fixedError.stack = error.stack || fixedError.stack;

  return fixedError;
};
