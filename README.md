Precompile your templates with style:

**config.json.hbs.us**

```
{
  "<%= target %>": {
    {{#options}}
    "{{<%= key %>}}": "{{<%= val %>}}"{{#unless @last}},{{/unless}}
    {{/options}}
  }
}
```

**script.js**

```javascript
// runtime-jade, handlebars-runtime and less MUST be included to run at client-side
var config = require('tarima').load('config.json.hbs.us');

var data = {
  target: 'main',
  key: 'field',
  val: 'value',
  options: [
    { field: 'item', value: 'something' },
    { field: 'other', value: 'setting' }
  ]
};

var fs = require('fs');

fs.writeFileSync('config.json.hbs', 'module.exports = ' + config.compile(data) + ';');
fs.writeFileSync('config.json', config.render(data));

var test = JSON.parse(fs.readFileSync('config.json'));

console.log(test.main.other == 'setting'); // true
```

[![Build Status](https://travis-ci.org/pateketrueke/tarima.png)](https://travis-ci.org/pateketrueke/tarima)
