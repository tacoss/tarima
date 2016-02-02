var util = require('./util');

module.exports = {
  render: function(filename, source, done) {
    util.render({
      parts: filename.split('.').slice(1),
      source: source,
      locals: {}
    }, done);
  }
};
