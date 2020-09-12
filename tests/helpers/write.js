const fs = require('fs');
const path = require('path');

module.exports = (file, content) => {
  file = path.join(__dirname, '../fixtures', file);
  fs.writeFileSync(file, content);
};
