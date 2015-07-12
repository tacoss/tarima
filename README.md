# Tarima

[![Build Status](https://travis-ci.org/gextech/tarima.png?branch=master)](https://travis-ci.org/gextech/tarima) [![NPM version](https://badge.fury.io/js/tarima.png)](http://badge.fury.io/js/tarima) [![Coverage Status](https://coveralls.io/repos/gextech/tarima/badge.png?branch=master)](https://coveralls.io/r/gextech/tarima?branch=master)

![Tarima](https://dl.dropboxusercontent.com/u/2726997/img/tarima_small.png)

```bash
$ npm install tarima
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

If a filename called `tpl.x.y` have two extensions, each extension will invoke a particular engine from right to left respectively.

When a extension has no registered engine, the pipeline will continue with the next engine in the chain loop.

- `params.next` will be passed with the name of the next file-extension
- `params.client ` will be `true` if was invoked with `compile()`
- `params.source` is used if the engine returns nothing

Currently tarima supports:

- **CoffeeScript** for `.coffee`
- **EJS** for `.ejs`
- **Handlebars** for `.hbs`
- **Jade** for `.jade`
- **Javascript** for `.js` and `.es6.js`
- **JSON** for `.json`
- **LESS** for `.less`
- **Markdown** for `.md`, `.coffee.md` and `.litcoffee`
- **Ractive** for `.ract`

Some engines can compile to `.js` but most will `render()` only.

### Available methods

#### `add(type, callback)`

Register a custom extension and callback.

```javascript
tarima.add('foo', function(params) {
  if (params.next === 'baz') {
    return 'bazzinga';
  }
});
```

The `params` object looks like:

```javascript
{
  next: undefined,
  client: false,
  filepath: '',
  filename: 'foo.js.coffee',
  parts: [ 'js', 'coffee' ],
  name: 'foo',
  ext: 'js',
  options: { locals: {} },
  source: '-> "string"',
  keypath: 'foo'
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

Note that in the browser a runtime is required for some engines.

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

#### `bundle(array, options)`

Will bundle the array of templates into a stringified JST variable.

```javascript
var code = tarima.bundle([tarima.parse('bar.js.ejs', '<%= value %>')]);
```

## Dependant tools

- [gulp-tarima](https://github.com/gextech/tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Issues?

You're welcome to open a ticket or submit a PR. ;-)
