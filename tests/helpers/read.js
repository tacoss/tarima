const fs = require('fs');
const path = require('path');
const exists = require('./exists');

module.exports = filepath => {
  filepath = path.join(__dirname, '../fixtures', filepath);
  if (exists(filepath)) {
    return fs.readFileSync(filepath).toString();
  }
};
