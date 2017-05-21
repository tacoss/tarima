'use strict';

const fs = require('fs');
const path = require('path');

const merge = require('../../helpers/merge');
const parse = require('../../helpers/parse');
const render = require('../../helpers/render');
const toArray = require('../../helpers/to-array');
const support = require('../../support');

let fsbx;

module.exports = (options, params, done) => {
  /* eslint-disable import/no-unresolved */
  /* eslint-disable global-require */
  fsbx = fsbx || require('fuse-box');

  const baseDir = path.resolve(options.cwd || '.');
  const baseFile = path.relative(baseDir, params.filename);

  const opts = merge({}, options['fuse-box'] || options.fusebox || {});
  const deps = [];

  toArray(params.data._external)
    .concat(toArray(opts.external))
    .concat(toArray(options.external
      ? Object.keys(options.external)
      : []))
    .forEach(dep => deps.push(`+${dep}`));

  // backup
  const _options = params.options;

  const fuse = fsbx.FuseBox.init({
    log: false,
    debug: false,
    cache: true,
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
        if (params.filename === file.info.absPath) {
          file.contents = params.source;
          file.isLoaded = true;
          return params.source;
        }

        file.loadContents();

        const sub = parse(file.info.absPath, file.contents.toString(), _options);

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
        try {
          params.source = fs.readFileSync(bundle.context.output.lastWrittenPath).toString();
          fs.unlinkSync(bundle.context.output.lastWrittenPath);
        } catch (e) {
          // do nothing
        }
      });
    }
  });

  fuse.run()
    .catch(done)
    .then(() => done());
};
