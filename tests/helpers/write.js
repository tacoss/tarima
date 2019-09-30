const fs = require('fs');
const path = require('path');
const exists = require('./exists');

module.exports = (file, content) => {
  file = path.join(__dirname, '../fixtures', file);
  fs.writeFileSync(file, content);
};
