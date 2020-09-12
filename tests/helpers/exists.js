const fs = require('fs');

module.exports = file => {
  try {
    return fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
};
