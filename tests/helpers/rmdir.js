const path = require('path');
const rimraf = require('rimraf');

module.exports = filepath => {
  rimraf.sync(path.join(__dirname, '../fixtures', filepath));
};
