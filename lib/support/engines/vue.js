var fs = require('fs');
var path = require('path');
var chain = require('siguiente');
var toSource = require('tosource');

var _export = /(module\.)?exports\s*=|export\s+default/;

var _commentsPattern = /\/\*.*?\*\//g;
var _allSelectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;
var _singleSelector = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
var _excludedPatterns = /^\s*(?:@media|@keyframes|to|from|@font-face|\d+%)/;

function fn(code) {
  return 'function(_h, context){' + code + '}';
}

function wrap(view, short) {
  if (view.errors && view.errors.length) {
    throw new Error(view.errors.join('; '));
  }

  var _code = (short ? '[' : '{render:') + fn(view.render)
    + ', ' + (short ? '' : 'staticRenderFns:') + '[' + view.staticRenderFns.map(fn).join(',\n')
    + ']' + (short ? ']' : '}');

  // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
  _code = _code.replace(/with\(this\)/g, 'if(window.__VUE_WITH_STATEMENT__)');

  return _code;
}

function scope(id, styles) {
  var _attr = '[' + id + ']';

  return styles.map(function(css) {
    return css.replace(_commentsPattern, '')
      .replace(_allSelectorsPattern, function(_, $1) {
        if (_excludedPatterns.test($1)) {
          return _;
        }

        var selectors = $1.split(',').map(function(s) {
          return s.trim();
        });

        var scoped = selectors
          .map(function(s) {
            var match;
            var matches = [];

            while (match = _singleSelector.exec(s)) {
              matches.push([match[0], match[1] + _attr + match[2]]);
            }

            matches.forEach(function(m) {
              s = s.replace(m[0], m[1]);
            });

            return s;
          });

        return _.replace($1, scoped.join(', ') + ' ');
      });
  });
}

function render(_, self, params, view, out, key) {
  if (!view[key]) {
    out[key] = '';
    return;
  }

  var _content = [];

  function push(output) {
    _content.push(output.source);

    output.deps.forEach(function (dep) {
      if (params.deps.indexOf(dep) === -1) {
        params.deps.push(dep);
      }
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
      out[key] = _content
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
        out[key] = _content.join('\n');
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

    var _target = {
      styles: [],
    };

    render(_, this, params, view, _target, 'template');
    render(_, this, params, view, _target, 'script');

    if (view.styles && view.styles.length) {
      view.styles.forEach(function(style, key) {
        render(_, this, params, view.styles, _target.styles, key);
      }, this);
    }

    _.run(function(err) {
      if (!err) {
        try {
          var _id = params.name === 'index'
            ? path.basename(path.dirname(params.filename))
            : params.name;

          var _tpl = '__' + _id + '$t';
          var _view = '__' + _id + '$v';

          params.source = [
            'var ', _tpl, ' = ', _target.template ? wrap(vtc.compile(_target.template), true) : 'null', ';\n',
            'var ', _view, ' = {};\n',
            (_target.script || '')
              .replace(_export, _view + ' = '),
            _view, '._scopeId = "vue-', _id, '";\n',
            _view, '.render = ', _tpl, '[0];\n',
            _view, '.staticRenderFns = ', _tpl, '[1];\n',
          ].join('');

          if (params._rollup && _target.styles.length) {
            params.source += '\nif (typeof window !== "undefined" && window.__VUE_PUSH_STYLESHEET)'
              + ' window.__VUE_PUSH_STYLESHEET(' + toSource(scope('vue-' + _id, _target.styles)) + ');\n';
          }

          if (_target.script && _export.test(_target.script)) {
            params.source += '\n' + (_target.script || '').match(_export)[0];
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
