
register_engine('less', function(params) {
  var less = require('less'),
      parser, str;

  console.log(params.head, params.filename);

  return str;

  // var less = require('less'),
  //     compiler;

  // compiler = function(locals) {
  //   var output, parser,
  //       vars = [],
  //       inject;

  //   inject = function(from) {
  //     for (var key in from) {
  //       if (/boolean|number|string/.test(typeof from[key])) {
  //         vars.push('@' + (key.charAt() === '@' ? key.substr(1) : key) + ': ~' + JSON.stringify(from[key].toString()) + ';');
  //       }
  //     }
  //   };

  //   inject(locals);

  //   console.log('VARS --->', vars.concat([params.source]).join('\n'));

  //   parser = new less.Parser(defs_tpl('less', params.options));
  //   parser.parse(vars.concat([params.source]).join('\n'), function(e, tree) {
  //     output = tree.toCSS();
  //   });

  //   console.log('<--- CSS', output);

  //   return output;
  // };

  // console.log('LESS --->', !params.head);
  // console.log('--->', params.source);

  // if (!params.head || params.options.locals) {
  //   return compiler(params.options.locals);
  // }

  // return params.head ? compiler : params.source;
});
