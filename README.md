![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima --save-dev
```

**Tarima** is a pipeline library for templating  based on the filename extensions.

Define a template named `tpl.js.jade` and explicitly call `render()` or `compile()`:

```javascript
var tarima = require('tarima');

var template = 'h1 It works!';

var view = tarima.parse('tpl.js.jade', template);

console.log(view.render()); // <h1>It works!</h1>
console.log(view.compile()); // function template(locals) ...
```

Now rename your template into `tpl.html.jade` and the output will be the same.

## How the pipeline works

Tarima understands the `.html.jade` extension as: _render_ **jade** into markup since it can't _compile_ into **html**.

While `.js.ract.jade` means: _render_ **jade** into markup, then _compile_ **ract** into javascript.

You can use `.css.less` to _render_ **css**, or `.js.less` to _compile_ into a **js** function, etc.

### Available engines

Although not all filename extensions are chainable you can mix them on several and useful ways.

- **CoffeeScript** can compile only into `.js`
- **CSS** can be _compiled_ into `.js`; render `.ejs` and `.hbs`
- **EJS** can compile and render from anything (?)
- **Handlebars** can compile and render from anything (?)
- **HTML** can be _compiled_ into `.js`; render `.ejs`, `.hbs`; render from `.ract`
- **Jade** can compile into `.js`; render `.ejs`, `.hbs` and `.html`
- **Javascript** anything can compile into this (?)
- **JSON** can compile only into `.js`
- **LESS** can compile into `.js`; render `.ejs`, `.hbs` and `.css`
- **Markdown** can compile into `.js`; render `.ejs`, `.hbs` and `.html`; render from `.ract`; `.coffee` _render_ as Literate CoffeeScript
- **Ractive** can compile into `.js`; render `.ejs`, `.hbs` and `.html`

### Available methods

#### `add(type, callback)`

Register a custom extension and callback.

The callback receive the partial parameters and a `next()` callback for validating supported target extensions:

```javascript
tarima.add('foo', function(params, next) {
  if (next('baz', 'bar')) {
    // ...
  }
});

// tpl.bar.foo => OK
// tpl.baz.foo => OK
// tpl.buzz.foo => EROR
```

If the target extension is not allowed an exception will be thrown.

The `params` object looks like:

```javascript
{
  filepath: '',
  filename: 'foo.js.coffee',
  parts: [ 'coffee' ],
  name: 'foo',
  ext: 'js',
  options: { locals: {} },
  source: '-> "string"',
  keypath: 'foo',
  type: 'coffee',
  client: false
}
```

Using `params.source` the callback must build the string to render or compile it.

If `params.client` is `true` it must return a compiled function to render on the client:

```javascript
var tpl = new TemplateEngine(params.source, params.options);

if (params.client) {
  return tpl.compileClient();
}

return tpl.compile();
```

In the browser is required to provide a runtime for some engines.

#### `parse(filepath, source, options)`

Generate a partial view from the given source and filepath.

```javascript
var view = tarima.parse('foo.js.jade', 'h1 It works');
```

#### `load(filepath, options)`

Same as parse but reading from filesystem instead.

```javascript
var view = tarima.load('/path/to/foo.js.jade');
```

## Dependant tools

- [gulp-tarima](https://github.com/gextech/tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Having issues?

Please open a ticket or send a PR. ;-)

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=master)](https://travis-ci.org/gextech/tarima) [![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima) [![Coverage Status](https://coveralls.io/repos/gextech/tarima/badge.png?branch=master)](https://coveralls.io/r/gextech/tarima?branch=master)
