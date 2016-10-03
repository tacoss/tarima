var chain = require('siguiente');
var toSource = require('tosource');

var _export = /(module\.)?exports\s*=|export\s+default/;

function fn(code) {
  return 'function(_h, context){' + code + '}';
}

function wrap(view) {
  if (view.errors && view.errors.length) {
    throw new Error(view.errors.join('; '));
  }

  return '{\n  render: ' + fn(view.render)
    + ',\n  staticRenderFns: [' + view.staticRenderFns.map(fn).join(',\n') + ']\n}';
}

function render(_, _render, params, view, key) {
  if (!view[key]) {
    return;
  }

  if (!this.support.isSupported('.' + view[key].lang)) {
    return;
  }

  _.then(function(next) {
    _render({
      filename: params.name + '.' + view[key].lang,
      options: params.options,
      source: view[key].content,
      parts: [view[key].lang],
      name: params.name,
      data: {},
      deps: []
    }, function(err, data) {
      if (err) {
        next(err);
      } else {
        view[key] = data.source;

        data.deps.forEach(function (dep) {
          params.deps.push(dep);
        });

        next();
      }
    });
  });
}

function compile(params, cb) {
  var vtc = this.vueTemplateCompiler;

  if (params.source.indexOf('<template') === -1 && params.source.indexOf('</template>') === -1) {
    params.source = wrap(vtc.compile(params.source));
    cb();
  } else {
    var view = vtc.parseComponent(params.source);

    var _ = chain();

    render(_, this.render, params, view, 'template');
    render(_, this.render, params, view, 'script');

    if (view.styles && view.styles.length) {
      view.styles.forEach(function(style, key) {
        render(_, this.render, params, view.styles, key);
      }, this);
    }

    _.run(function(err) {
      if (!err) {
        if (view.template) {
          view.template = wrap(vtc.compile(view.template));
        }

        params.source = [
          view.template ? 'var __tpl$ = ' + view.template + ';\n' : '',
          view.styles ? 'var __css$ = ' + toSource(view.styles) + ';\n' : '',
          (view.script || '').replace(_export, 'var __view$ ='),
          (view.script || '').match(_export)[0] + ' __view$;\n',
          '__view$.render = __tpl$.render;\n',
          '__view$.staticRenderFns = __tpl$.staticRenderFns;\n',
          '__view$.includedStylesheets = __css$;\n',
        ].join('');
      }

      cb(err);
    });
  }
}

module.exports = {
  ext: 'js',
  type: 'script',
  support: ['vue'],
  requires: ['vue-template-compiler'],
  render: compile,
  compile: compile
};
