const fs = require('fs');

module.exports = file => {
  let e;
  try {
    return fs.statSync(file).isFile();
  } catch (error) {
    e = error;
    false;
  }
};
