const { expect } = require('chai');

/* global describe, it */

describe('Data', () => {
  describe('JSON', () => {
    const json_block = JSON.stringify({
      foo: 'bar'
    });

    test(['x.json', json_block], result => {
      expect(result.source).to.eql('{"foo":"bar"}');
    });
  });

  describe('YAML', () => {
    const yaml_block = 'foo: bar';

    test(['x.yaml', yaml_block], result => {
      expect(result.source).to.eql('{\n  "foo": "bar"\n}');
    });
  });
});

describe('Markup', () => {
  describe('Liquid', () => {
    test(['x.liquid', '{% assign x = "y" %}{{x}}'], result => {
      expect(result.source).to.eql('y');
      expect(result.extension).to.eql('html');
    });
  });

  describe('AsciiDoc', () => {
    test(['x.adoc', '= Hello world'], result => {
      expect(result.source).to.match(/<h1[<>]*?>Hello world<\/h1>/);
      expect(result.extension).to.eql('html');
    });
  });

  describe('Markdown', () => {
    test(['x.md', '# ok'], result => {
      expect(result.source).to.contain('</h1>');
      expect(result.extension).to.eql('html');
    });

    test(['x.coffee.md', '> ok\n\n    foo bar'], result => {
      expect(result.source).to.contain('foo(bar)');
      expect(result.extension).to.eql('js');
    });

    test(['x.y.md', '# ok'], result => {
      expect(result.source).to.contain('</h1>');
      expect(result.extension).to.eql('y');
    });
  });

  describe('Pug/Jade', () => {
    test(['x.pug', 'x y'], result => {
      expect(result.source).to.contain('<x>y</x>');
      expect(result.extension).to.eql('html');
    });

    test(['x.y.pug', 'x y'], result => {
      expect(result.source).to.contain('<x>y</x>');
      expect(result.extension).to.eql('y');
    });

    test(['x.js.pug', 'x y'], result => {
      expect(result.source).to.contain('function');
      expect(result.extension).to.eql('js');
    });

    test(['x.js.jade', 'x y'], result => {
      expect(result.source).to.contain('function');
      expect(result.extension).to.eql('js');
    });
  });
});

describe('Scripting', () => {
  describe('TypeScript', () => {
    test(['x.ts', 'let foo = (x: string) => {}'], result => {
      expect(result.source).to.contain('var foo');
      expect(result.source).to.contain('(x)');
    });
  });

  describe('CoffeeScript', () => {
    test(['x.coffee', 'foo bar'], result => {
      expect(result.source).to.contain('foo(bar)');
      expect(result.extension).to.eql('js');
    });

    test(['x.js.coffee', 'foo bar'], result => {
      expect(result.source).to.contain('foo(bar)');
      expect(result.extension).to.eql('js');
    });

    test(['x.litcoffee', '> ok\n\n    foo bar'], result => {
      expect(result.source).to.contain('foo(bar)');
      expect(result.extension).to.eql('js');
    });

    test(['x.y.litcoffee', '    foo bar'], result => {
      expect(result.source).to.eql('    foo bar');
      expect(result.extension).to.eql('y');
    });

    test(['x.js.litcoffee', '    foo bar'], result => {
      expect(result.source).to.contain('foo(bar);');
      expect(result.extension).to.eql('js');
    });
  });

  describe('ES6 (bublé)', () => {
    test(['x.es6', 'export default () => 42'], result => {
      expect(result.source).to.contain('module.exports');
      expect(result.source).to.contain('42');
      expect(result.extension).to.eql('js');
    });

    test(['x.es6.js', 'export default () => 42'], result => {
      expect(result.source).to.contain('module.exports');
      expect(result.source).to.contain('42');
      expect(result.extension).to.eql('js');
    });

    test(['x.y.es6', 'export default 42'], result => {
      expect(result.source).to.match(/module.exports[\s\S]*=[\s\S]*42/);
      expect(result.extension).to.eql('y');
    });
  });

  describe('ES6 (traceur)', () => {
    test(['x.es6', '/**\n---\n$transpiler: traceur\n---\n*/\nexport default () => 42'], result => {
      expect(result.source).to.contain('module.exports');
      expect(result.source).to.contain('$__default');
    });
  });

  describe('ES6 (babel)', () => {
    test([
      'x.es6',
      'export default () => 42',
      {
        babel: true
      }
    ], result => {
      expect(result.source).to.contain('module.exports');
      expect(result.source).to.contain('(() => 42)');
    });
  });

  describe('ES6 (nodent)', () => {
    test([
      'x.es6',
      'const x = async () => 42;\nexport default async () => await x();',
      {
        nodent: true
      }
    ], result => {
      expect(result.source).to.contain('$asyncbind');
      expect(result.source).to.contain('new Promise');
      expect(result.source).to.contain('module.exports =');
    });
  });

  describe('ES6 (sucrase)', () => {
    test(['x.es6', '/**\n---\n$transpiler: sucrase\n---\n*/\nexport class { foo = \'bar\' }'], result => {
      expect(result.source).to.contain("this.foo = 'bar'");
    });
  });

  if (process.env.CI) {
    describe('ES6 (swc)', () => {
      test([
        'x.es6',
        'const x = async () => 42;\nexport default async () => await x();',
        {
          swc: true
        }
      ], result => {
        expect(result.source).to.contain('var x = async function');
        expect(result.source).to.contain('module.exports = async');
      });
    });
  }
});

describe('Mixed', () => {
  describe('EJS', () => {
    test(['x.ejs', '<%= 1 %>'], result => {
      expect(result.source).to.eql('1');
      expect(result.extension).to.eql('html');
    });

    test(['x.y.ejs', '<%= 1 %>'], result => {
      expect(result.source).to.eql('1');
      expect(result.extension).to.eql('y');
    });

    test(['x.js.ejs', '<%= 1 %>'], result => {
      expect(result.source).to.contain('function');
      expect(result.extension).to.eql('js');
    });
  });

  describe('Handlebars', () => {
    test(['x.hbs', '<x>{{x}}</x>'], result => {
      expect(result.source).to.contain('<x>y</x>');
      expect(result.extension).to.eql('html');
    }, {
      x: 'y'
    });

    test(['x.y.hbs', '<x>{{x}}</x>'], result => {
      expect(result.source).to.contain('<x>y</x>');
      expect(result.extension).to.eql('y');
    }, {
      x: 'y'
    });

    test([
      'x.js.hbs',
      '<x>{{x}}</x>',
      {
        client: true
      }
    ], result => {
      expect(result.source).to.contain('Handlebars.template');
      expect(result.extension).to.eql('js');
    });
  });
});

describe('Stylesheets', () => {
  if (process.env.CI) {
    describe('SASS', () => {
      test(['x.sass', '$x: red;\n*\n  color: $x'], result => {
        expect(result.source).to.contain('color: red');
      });
    });
  }

  // FIXME: why this?
  // Error.call = (x) -> new Error(x)
  describe('LESS', () => {
    test(['x.less', '@x:y;&*{x:@x}'], result => {
      expect(result.source).to.contain('* {\n  x: y;\n}');
      expect(result.extension).to.eql('css');
    });

    test(['x.y.less', '&*{x:y}'], result => {
      expect(result.source).to.eql('&*{x:y}');
      expect(result.extension).to.eql('y');
    });

    test(['x.css.less', '&*{x:y}'], result => {
      expect(result.source).to.contain('x: y;');
      expect(result.extension).to.eql('css');
    });
  });

  describe('Styl', () => {
    test(['x.styl', '*{x:y}'], result => {
      expect(result.source).to.contain('x: y;');
      expect(result.extension).to.eql('css');
    });

    test(['x.y.styl', '*{x:y}'], result => {
      expect(result.source).to.eql('*{x:y}');
      expect(result.extension).to.eql('y');
    });
  });

  describe('PostCSS', () => {
    test(['x.css', '.x{color:red}'], result => {
      expect(result.source).to.eql('.x{color:red}');
      expect(result.extension).to.eql('css');
    });

    test(['x.y.css', '.x{color:red}'], result => {
      expect(result.source).to.eql('.x{color:red}');
      expect(result.extension).to.eql('y');
    });

    test([
      'x.post.css',
      ':fullscreen a{display:flex}',
      {
        postcss: {
          plugins: ['autoprefixer']
        }
      }
    ], result => {
      expect(result.source).to.contain('-webkit');
      expect(result.source).to.contain('-moz');
      expect(result.extension).to.eql('css');
    });
  });
});
