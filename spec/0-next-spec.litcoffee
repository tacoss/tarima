## Tarima II

> This is a major rewrite focused on modern javascript development.

Tarima's goal is providing the same development workflow across multiple source files.

Much as webpack does, but using a different setup, based on how Rails handle its front-end assets with sprockets.

## File extensions

Files MUST be explicitly set its own _transpilation pipeline_ through extensions:

```coffee
test.less
     ^
     LESS engine
```
A file named `test.less` will suffice but:

1. when compiling for server, it should be named `test.css.less`
2. when compiling for client, it should be named `test.js.less`
3. otherwise, will compile as for server, unless `client: true` is given

## Expected output

Some engines can pre-compile and return a standalone (or with minimal a runtime) template as regular function:

```js
module.exports = function template(h, data) {
  return h('h1', data.value);
};
```

When this is not possible, the source content will be returned as string, in a wrapper function:

```js
module.exports = function () {
  return '<h1>{{value}}</h1>';
};
```

## Render pipeline

Many file extensions can be chained to produce more interesting results, e.g. `file.js.pug`

```pug
h1 Hi {{name}}!
```

Will produce a pre-compiled view for Pug:

```js
module.exports = function (locals) {
  // pug-compiled code...
};
```

## Implementation

Support is enabled much like as `require.extensions` does, e.g.

```js
const tarima = require('tarima');

tarima.support.add('.html', {
  render(params, cb) {
    // does nothing
    cb();
  },
  compile(params, cb) {
    params.source = `function () {
      return ${JSON.stringify(params.source)};
    }`;
    cb();
  },
});
```

The renderer will call each found engine for any given extension, until the last extension is found, each source will be rendered.

Once the last extension is reached it will be compiled for server or client side:

- `test.less` &rarr; `test.css.less` (default extension: `.css`)
- `test.pug` &rarr; `test.html.pug` (default extension: `.html`)
- `test.litcoffee` &rarr; `test.coffee.md` (default extension: `.js`)

If the extensions has no defined support, the source code is passed without changes.

## Source file

```js
{
  "filename": "test.coffee.md",
  "options": {}, // passed options to the factory
  "source": "## Example\n    console.log 'OK'",
  "parts": ["coffee", "md"]
  "name": "test",
  "data": {}, // any data passed as front-matter
  "deps": [], // all imported-or-required sources
  "locals": {}, // values passed from the callback
  "runtimes": [], // js-expressions for required modules
  "extension": "js"
}
```

Specs for rendering:

    render = require('../lib/helpers/render')

    describe 'Renderer', ->
      it 'will run on supported extensions', (done) ->
        partial =
          filename: 'test.js.pug'
          source: 'h1 It works!'
          parts: ['js', 'pug']
          runtimes: []
          options: {}
          deps: []

        render partial, (err, result) ->
          expect(result.source).toContain 'function template'
          expect(result.source).toContain 'It works!'
          expect(result.runtimes[0]).toContain 'ug-runtime'
          done()

      it 'will skip all unsupported extensions', (done) ->
        partial =
          filename: 'test.foo.bar'
          source: 'test code'
          parts: ['foo', 'bar']
          runtimes: []
          options: {}
          deps: []

        render partial, (err, result) ->
          expect(result).toEqual partial
          done()
