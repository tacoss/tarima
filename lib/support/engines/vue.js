var fs = require('fs');
var path = require('path');
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

  var _code =  '{\n  render: ' + fn(view.render)
    + ',\n  staticRenderFns: [' + view.staticRenderFns.map(fn).join(',\n')
    + ']\n}';

  // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
  _code = _code.replace(/with\(this\)/g, 'if(window.__VUE_WITH_STATEMENT__)');

  return _code;
}

function render(_, self, params, view, key) {
  if (!view[key]) {
    view[key] = '';
    return;
  }

  var _content = [];

  function push(output) {
    _content.push(output.source);

    output.deps.forEach(function (dep) {
      params.deps.push(dep);
    });
  }

  if (view[key].src) {
    if (key === 'template' && view[key].content) {
      throw new Error('Tag <template> cannot have both src and content');
    }

    _.then(function(next) {
      var _file = path.resolve(path.dirname(params.filename), view[key].src);
      var _params = self.parse(_file, fs.readFileSync(_file).toString(), params.options);

      self.render(_params, function(err, output) {
        if (!err) {
          push(output);
        }

        next(err);
      });
    });
  }

  if (view[key].lang && !self.support.isSupported('.' + view[key].lang)) {
    _.then(function(next) {
      view[key] = _content
        .concat(view[key].content)
        .join('\n');
      next();
    });
    return;
  }

  _.then(function(next) {
    self.render({
      filename: params.name + '.' + view[key].lang,
      options: params.options,
      source: view[key].content,
      parts: [view[key].lang],
      name: params.name,
      data: {},
      deps: []
    }, function(err, output) {
      if (!err) {
        push(output);
        view[key] = _content.join('\n');
      }

      next(err);
    });
  });
}

function compile(params, cb) {
  var vtc = this.vueTemplateCompiler;

  if (params.source.indexOf('<template') === -1 && params.source.indexOf('</template>') === -1) {
    params.source = 'Vue.extend(' + wrap(vtc.compile(params.source)) + ')';
    cb();
  } else {
    var view = vtc.parseComponent(params.source);

    if (view.script && !view.script.lang) {
      view.script.lang = 'js';
    }

    var _ = chain();

    render(_, this, params, view, 'template');
    render(_, this, params, view, 'script');

    if (view.styles && view.styles.length) {
      view.styles.forEach(function(style, key) {
        render(_, this, params, view.styles, key);
      }, this);
    }

    _.run(function(err) {
      if (!err) {
        try {
          var _tpl = '__' + params.name + '$t';
          var _css = '__' + params.name + '$c';
          var _view = '__' + params.name + '$v';

          params.source = [
            view.template ? 'var ' + _tpl + ' = ' + wrap(vtc.compile(view.template)) + ';\n' : '',
            view.styles ? 'var ' + _css + ' = ' + toSource(view.styles) + ';\n' : '',
            'var ', _view, ' = {};\n',
            (view.script || '')
              .replace(_export, _view + ' = '),
            _view, '.render = ', _tpl, '.render;\n',
            _view, '.staticRenderFns = ', _tpl, '.staticRenderFns;\n',
            _view, '.includedStylesheets = ', _css, ';'
          ].join('');

          // TODO: detect browser and insert/remove style/link tags? (beforeMount vs mounted => destroyed)

          if (view.script && _export.test(view.script)) {
            params.source += '\n' + (view.script || '').match(_export)[0];
          } else {
            params.source += '\n' + (params._rollup ? 'export default' : 'module.exports =');
          }

          params.source += ' Vue.extend(' + _view + ');\n';
        } catch (e) {
          return cb(e);
        }
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
  compile: compile,
  included: "var Vue=Vue||(typeof window!=='undefined'?window:global).Vue||require('v'+'ue');"
};
