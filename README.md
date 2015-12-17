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

When a extension has no registered engine, the pipeline will stop and return the current chain params.

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

#### `engines()`

Return all the registered extensions.

```javascript
console.log(tarima.engines()); // ['coffee', 'ejs', ...]
```

### Options

- `cwd` &mdash; Set relative keys on `bundle()`
- `locals` &mdash; Local variables on `bundle()`
- `filter` &mdash; Execute this callback after `parse()`
- `wrapper` &mdash; Execute this callback after `bundle()`
- `marker` &mdash; Custom marker for extracting front-matter
- `exports` &mdash; If true prepends `module.exports` on fn-views

If you want to override certain options for any engine:

```javascript
var view = tarima.load('/path/to/view.js.coffee', {
  // custom settings for coffee-engine
  coffee: { bare: true }
});
```

### Calling the pipeline

Once you've parsed or loaded a template you can get its output or data, or both.

#### compile(locals)

Return the pre-compiled version if possible, otherwise return the same source.

```javascript
var js = tarima.parse('tpl.js.jade', 'h1 ok').compile();

console.log(js); // function template(locals) ...
```

#### render(locals)

Render and return as string, most template-engines do this.

```javascript
var html = tarima.parse('tpl.html.jade', 'h1 ok').render();

console.log(html); // <h1>ok</h1> ...
```

#### data(locals, raw)

Will `render()` and return the resulting view-params as is.

- If `raw` is **true** `compile()` will be called instead
- If `locals` is boolean it will be used as `raw` and `locals` will be empty

```javascript
var tpl = tarima.parse('tpl.js.jade', 'h1 ok');

console.log(tpl.data().source); // <h1>ok</h1> ...
console.log(tpl.data(true).source); // function template(locals) ...
```

## Front-matter

All parsed files can use a front-matter block for local data.

```jade
//-
  ---
  title: Untitled
  ---

h1= title
```

## Dependant tools

- [tarima-cli](https://github.com/gextech/tarima-cli) support for CLI
- [gulp-tarima](https://github.com/gextech/gulp-tarima) support for Gulp
- [grunt-tarima-task](https://github.com/gextech/grunt-tarima-task) support for Grunt

## Issues?

You're welcome to open a ticket or submit a PR. ;-)
