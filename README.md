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
var template = require('tarima').load('config.json.hbs.us'),
    config = template({ target: 'main', key: 'field', val: 'value' });

var data = [
  { field: 'item', value: 'something' },
  { field: 'other', value: 'setting' }
];

var fs = require('fs');

fs.writeFileSync('config.json.hbs', config.toString());
fs.writeFileSync('config.json', config({ options: data }));

var test = JSON.parse(fs.readFileSync('config.json'));

console.log(test.main.other == 'setting'); // true
```

[![Build Status](https://travis-ci.org/pateketrueke/tarima.png)](https://travis-ci.org/pateketrueke/tarima)
