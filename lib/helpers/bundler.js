var path = require('path'),
    chain = require('siguiente');

module.exports = function(partial, options) {
  return function(locals, cb) {
    if (typeof locals === 'function') {
      cb = locals;
      locals = {};
    }

    var _ = chain(),
        bundle = [];

    (Array.isArray(partial) ? partial : [partial]).forEach(function(view) {
      _.then(function(next) {
        view.render(locals, function(err, result) {
          console.log(result);
          next();
        });
      });
    });

    _.run(function(err) {
      cb(err);
    });
  };
}

// var bundle = ['less', 'ract', 'jade', 'hbs', 'ejs', 'idom'];

// module.exports = function(views, options) {
//   // options = options || {};

//   // var code = [],
//   //     all = [];

//   // code.push('var JST = {};');

//   // views.forEach(function(tpl) {
//   //   if (bundle.indexOf(tpl.params.parts[1]) === -1) {
//   //     return;
//   //   }

//   //   if (tpl.params.dependencies && all.indexOf(tpl.params.dependencies) === -1) {
//   //     all.push(tpl.params.dependencies);
//   //   }

//   //   var output = tpl.compile(options.locals);

//   //   code.push('/* ' + path.join(tpl.params.filepath, tpl.params.filename) + ' */');
//   //   code.push('JST["' + tpl.params.keypath + '"] = ' + (output.trim() || 'null') + ';');
//   // });

//   // code.unshift(all.join('\n'));
//   // code = code.join('\n');

//   // if (typeof options.wrapper === 'function') {
//   //   code = options.wrapper(code);
//   // }

//   // return code;
// };
