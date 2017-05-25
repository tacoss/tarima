'use strict';

const debug = require('debug')('tarima:renderer');

const fs = require('fs');
const path = require('path');

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

            Object.defineProperty(_ctx, key, {
              get() {
                /* eslint-disable global-require */
                return require(moduleId);
              },
            });
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

  params.locals.self = {
    cwd: params.options.cwd,
    parent: path.relative(params.options.cwd, params.filename),
    filename: path.relative(params.options.cwd, params.filename),
  };

  params.runtimes = [];

  delete params.locals._bundle;
  delete params.locals._format;
  delete params.locals._bundler;
  delete params.locals._external;
  delete params.locals._transpiler;

  const pipeline = params.parts.slice().reverse();
  const extensions = params.options.extensions || {};

  return pipeline
    .reduce((prev, cur, i) =>
      prev.then(() => {
        params.extension = cur;

        if (extensions[cur] !== false) {
          const engine = support.resolve(cur);

          if (engine) {
            params.extension = engine.ext;

            return push(engine, pipeline[i + 1]);
          }
        }
      }), Promise.resolve())
    .then(() => {
      if (params.isScript
        && (support.isJSON(params.source)
        || support.isTemplateFunction(params.source))) {
        params.source = `${params._import ? 'export default' : 'module.exports ='} ${params.source}`;
      }

      if (!params.isScript && params.data.$render) {
        const _layout = path.resolve(path.dirname(params.filename), params.data.$render);
        const _params = parse(_layout, fs.readFileSync(_layout).toString(), params.options);

        _params.locals = merge({}, _params.locals || {}, params.locals);
        _params.locals.yield = params.source;
        _params.locals.self = {
          cwd: params.options.cwd,
          parent: path.relative(params.options.cwd, params.filename),
          filename: path.relative(params.options.cwd, _params.filename),
        };

        render(_params, (err, result) => {
          params.source = result.source;
          params.sourceMap = result.sourceMap;

          result.deps.forEach(dep => {
            if (params.deps.indexOf(dep) === -1) {
              params.deps.push(dep);
            }
          });

          params.deps.push(_layout);

          done(undefined, params);
        });
      } else {
        done(undefined, params);
      }
    })
    .catch(error => done(error, params));
};
