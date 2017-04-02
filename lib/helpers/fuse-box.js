'use strict';

const path = require('path');

const parse = require('./parse');
const render = require('./render');
const support = require('../support');

let fsbx;

module.exports = (options, params, done) => {
  /* eslint-disable global-require */
  fsbx = fsbx || require('fuse-box');

  const exts = support.getExtensions();

  fsbx.FuseBox.init({
    log: false,
    homeDir: path.dirname(params.filename),
    plugins: [{
      test: new RegExp(`\\.(?:${exts
        .map(ext => ext.replace(/^\./, ''))
        .join('|')
        .replace(/\./g, '\\.')
      })$`),
      init(context) {
        exts.forEach(ext => {
          context.allowExtension(ext);
        });
      },
      transform(file) {
        file.loadContents();

        const sub = parse(file.info.absPath, file.contents.toString(), params.options);

        if (!sub.isScript && sub.parts[0] !== 'js') {
          sub.parts.unshift('js');
        }

        sub._import = true;

        return new Promise((resolve, reject) => {
          render(sub, (err, result) => {
            if (err) {
              reject(err);
            } else {
              file.contents = result.source;
              file.analysis.analyze();
              resolve(file.contents);
            }
          });
        });
      },
    }],
  }).bundle(`> ${path.basename(params.filename)}`)
  .then(result => {
    params.source = result.content.toString();
    done();
  })
  .catch(done);
};
