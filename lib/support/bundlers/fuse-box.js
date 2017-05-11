'use strict';

const fs = require('fs');
const path = require('path');

const merge = require('../../helpers/merge');
const parse = require('../../helpers/parse');
const render = require('../../helpers/render');
const support = require('../../support');

let fsbx;

module.exports = (options, params, done) => {
  /* eslint-disable import/no-unresolved */
  /* eslint-disable global-require */
  fsbx = fsbx || require('fuse-box');

  const baseDir = path.dirname(params.filename);
  const baseFile = path.basename(params.filename);

  const opts = merge({}, options['fuse-box'] || options.fusebox || {});
  const deps = [];

  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    }

    return value ? String(value).split(/\W/) : [];
  }

  toArray(params.data._external)
    .concat(toArray(opts.external))
    .forEach(dep => {
      deps.push(`+${dep}`);
    });

  const fuse = fsbx.FuseBox.init({
    log: false,
    debug: false,
    cache: false,
    hash: false,
    homeDir: baseDir,
    output: '/tmp/$name.bundle.js',
    sourceMaps: opts.sourceMap || opts.compileDebug,
    standalone: typeof opts.standalone === 'undefined' ? true : opts.standalone,
    plugins: [{
      test: support.getExtensions(true),
      init(context) {
        support.getExtensions().forEach(ext => {
          context.allowExtension(ext);
        });
      },
      transform(file) {
        file.loadContents();

        const sub = parse(file.info.absPath, file.contents.toString(), params.options);

        if (!sub.isScript && sub.parts[0] !== 'js') {
          sub.parts.unshift('js');
        }

        sub.isScript = true;
        sub._import = true;

        return new Promise((resolve, reject) => {
          render(sub, (err, result) => {
            if (err) {
              reject(err);
            } else {
              // rewrite import/export
              file.contents = result.source;
              resolve(file.contents);
            }
          });
        });
      },
    }],
  });

  fuse.bundle(params.name)
  .instructions(`> ${baseFile} ${deps.join(' ')}`)
  .completed(result => {
    if (result.bundle) {
      result.bundle.producer.bundles.forEach(bundle => {
        params.source = fs.readFileSync(bundle.context.output.lastWrittenPath).toString();
        fs.unlinkSync(bundle.context.output.lastWrittenPath);
        done();
      });
    }
  });

  fuse.run();
};
