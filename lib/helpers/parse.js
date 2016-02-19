var path = require('path');

var parseFrontMatter = require('./front-matter');

module.exports = function(filename, source, options) {
  var params = {
    filename: filename,
    options: options || {},
    source: source || ''
  };

  params.parts = path.basename(params.filename).split('.');
  params.name = params.parts.shift();
  params.ext = params.parts[0];

  parseFrontMatter(params);

  return params;
};
