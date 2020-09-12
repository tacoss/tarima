const path = require('path');
const exists = require('./exists');
const rimraf = require('rimraf');

module.exports = file => {
  file = path.join(__dirname, '../fixtures', file);
  if (exists(file)) {
    rimraf.sync(file);
  }
};
