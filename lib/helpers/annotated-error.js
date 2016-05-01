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
  params.source = lines.slice(offset, 4).join('\n');

  if (typeof params.linenum !== 'undefined') {
    var lines = params.source.split('\n'),
        max = (params.linenum + lines.length).toString().length;

    debug.push(lines.map(function(line, num) {
      num += 1;

      return '  ' + (num === params.linenum ? '>' : ' ')
        + strPad(num + offset, max)
        + '| ' + line;
    }).join('\n'));

    debug.push((new Array(params.column + max + 7)).join(' ') + '^');
    debug.push('Error: ' + params.message[0].toLowerCase() + params.message.substr(1));
  } else {
    debug.push(params.source);
  }

  return debug.join('\n');
}

module.exports = function(file, error, source, linenum, column) {
  return errMark({
    filename: file,
    message: error,
    source: source,
    linenum: linenum,
    column: column
  });
};
