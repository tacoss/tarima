/* global document */

const buildVars = require('./build-vars');

// custom css-inliner for Vue components
const _inject = `if (typeof window !== "undefined")
  window.__VUE_PUSH_STYLESHEET = function (css) {
  var d = document;
  var s = d.createElement('style');
  var h = d.getElementsByTagName('head')[0];

  s.appendChild(d.createTextNode(css.join('')));
  h.appendChild(s);
}`;

const _tag = /<@(\w+)(\s+(?:\[.*?\]|\{.*?\}|".*?"|-?\d+(?:\d+)?|true|false|null))?>/g;

module.exports = (params, cb) => {
  return () => {
    cb(undefined, params);
  };
}

// module.exports = function(params) {
//   var filters = [];

//   if (Array.isArray(params.options.postRender)) {
//     Array.prototype.push.apply(filters, params.options.postRender);
//   }

//   if (typeof params.options.postRender === 'function') {
//     filters.push(params.options.postRender);
//   }

//   if (params.isScript) {
//     var locals = {};

//     if (params.options.globals) {
//       Object.keys(params.options.globals).forEach(function(key) {
//         locals[key] = params.options.globals[key];
//       });
//     }

//     Object.keys(params.data).forEach(function(key) {
//       locals[key] = params.data[key];
//     });

//     filters.push(buildVars(locals, 'global'));

//     if (params.source.indexOf('__VUE_WITH_STATEMENT__') > -1) {
//       var _styles = params.source.indexOf('__VUE_PUSH_STYLESHEET') > -1;

//       params.source = (_styles ? _inject + '\n' : '') + params.source
//         // https://github.com/znck/rollup-plugin-vue/blob/master/src/vueTransform.js#L50
//         .replace(/if\(window\.__VUE_WITH_STATEMENT__\)/g, 'with(this)');

//       // cleanup
//       params.source += (_styles ? '\n;if (typeof window !== "undefined") delete window.__VUE_PUSH_STYLESHEET;' : '');
//     }
//   } else {
//     // custom tag-helpers
//     params.source = params.source
//       .replace(_tag, function(_, tag, value) {
//         var args;

//         try {
//           args = value ? JSON.parse(value) : [];
//         } catch (e) {
//           throw new Error('Unable to parse: ' + _);
//         }

//         if (!params.options.helpers[tag]) {
//           throw new Error('Unknown tag helper: ' + _);
//         }

//         return params.options.helpers[tag]
//           .apply(null, !Array.isArray(args) ? [args] : args);
//       });
//   }

//   return filters;
// };
