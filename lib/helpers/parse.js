var path = require('path');

var load = require('./load');

module.exports = function(filename, source, options) {
  var params = {
    filename: filename,
    options: options || {},
    source: source || '',
    data: {}
  };

  // extract front-matter
  var marker = (params.options.marker || '---').replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');

  var matches = params.source.match(new RegExp('(?:^|\\n)( +|)(' + marker + ')\\s*([\\s\\S]+?)\\s*\\2\\s*(?:$|\\n)'));

  if (matches) {
    params.source = params.source.replace(matches[0], (new Array(matches[0].split('\n').length)).join('\n'));
    params.data = load(params.filename, matches[3].replace(new RegExp('^\\s{' + matches[1].length + '}', 'gm'), '')) || {};
  }

  // rendering options
  params.parts = path.basename(params.filename).split('.');
  params.name = params.parts.shift();

  return params;
};
