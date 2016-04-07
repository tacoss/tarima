var $ = require('./resolve');

var Rollup;

var fs = require('fs'),
    path = require('path');

var support = require('../support');

module.exports = function(options, params, done) {
  Rollup = Rollup || require($('rollup'));

  Rollup.rollup({
    entry: params.filename,
    plugins: [{
      resolveId: function(importee, importer) {
        if (!importer) {
          return importee;
        }

        var fixedModule = path.resolve(path.dirname(importer), importee);

        var i, exts = support.getKnownExtensions();

        for (i in exts) {
          if (fs.existsSync(fixedModule + exts[i])) {
            return fixedModule + exts[i];
          }

          if (fs.existsSync(path.join(fixedModule, 'index' + exts[i]))) {
            return path.join(fixedModule, 'index' + exts[i]);
          }
        }
      },
      load: function(id) {
        if (id === params.filename) {
          return params.source;
        }
      }
    }]
  }).then(function(bundle) {
    var output = bundle.generate();

    params.source = output.code;

    done(undefined, params);
  }).catch(function(error) {
    done(error);
  });
};
