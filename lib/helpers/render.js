'use strict';

const debug = require('debug')('tarima:renderer');

const parse = require('./parse');
const merge = require('./merge');
const support = require('../support');

module.exports = function render(params, done) {
  debug(params.filename);

  function push(engine, previous) {
    return new Promise((resolve, reject) => {
      const fixedMethod = previous === 'js' ? 'compile' : 'render';

      function append() {
        if (previous === 'js' && engine.included) {
          params.runtimes.push(engine.included);
        }

        resolve();
      }

      params.next = previous;

      try {
        const _ctx = {};

        _ctx.parse = parse;
        _ctx.render = render;
        _ctx.support = support;

        (engine.requires || [])
          .forEach(moduleId => {
            const key = moduleId
              .replace(/\W([a-z])/g, (_, word) => word.toUpperCase());

            /* eslint-disable global-require */
            _ctx[key] = require(moduleId);
          });

        let _called;

        const test = engine[fixedMethod].call(_ctx, params, err => {
          _called = true;

          if (err) {
            reject(err);
          } else {
            append();
          }
        });

        if (test && typeof test.then === 'function') {
          test.catch(reject).then(append);
          return;
        }

        if (engine[fixedMethod].length > 1) {
          return;
        }

        if (!_called) {
          append();
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  params.locals = merge({},
    params.options.globals,
    params.options.locals,
    params.locals,
    params.data);

  params.runtimes = [];
  params.isScript = 0;
  params.isTemplate = 0;

  delete params.locals._bundle;
  delete params.locals._format;
  delete params.locals._bundler;

  const pipeline = params.parts.slice().reverse();
  const extensions = params.options.extensions || {};

  return pipeline
    .reduce((prev, cur, i) =>
      prev.then(() => {
        let engine;

        params.extension = cur;

        if (extensions[cur] !== false) {
          engine = support.resolve(cur);

          if (engine) {
            params.extension = engine.ext;

            if (engine.type === 'template') {
              params.isTemplate += 1;
            }

            if (engine.type === 'script') {
              params.isScript += 1;
            }

            return push(engine, pipeline[i + 1]);
          }
        }
      }), Promise.resolve())
    .catch(error => done(error))
    .then(() => done(undefined, params));
};
