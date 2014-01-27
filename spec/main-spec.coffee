
engines = ['js', 'jade']

global.jade = require('jade').runtime

validateEngine = require('./validate-engines')
tarimaFixtures = require('./tarima-fixtures')
testEngine = require('./test-engine')


describe 'Tarima will take care:', ->
  xit 'should expose a reasonable version for debug', ->
    expect(tarima.version).not.toBeUndefined()
    expect(tarima.version.major).toMatch /^\d+$/
    expect(tarima.version.minor).toMatch /^\d+$/
    expect(tarima.version.micro).toMatch /^\d+$/
    expect(tarima.version.date).toMatch /^\d{8}$/

  describe 'validateEngine matcher', ->
    it 'would validate unsupported engines', ->
      expect(-> validateEngine().pass()).toThrow()

    describe 'js-engine', ->
      it 'should validate plain js-code integrity', ->
        expect(-> validateEngine('js').pass()).toThrow()
        expect(-> validateEngine('js').pass(tarimaFixtures('js').dummy)).not.toThrow()

    describe 'jade-engine', ->
      it 'should validate plain js-code integrity (jade)', ->
        expect(-> validateEngine('jade').pass()).toThrow()
        expect(-> validateEngine('jade').pass(tarimaFixtures('jade').dummy)).not.toThrow()

  ###

    The idea: pipe out the result from one template to another.

    So, the evaluation order is right to left, if there is no more extensions
    or cannot be evaluated will return it's source code. Otherwise it will parse.

  ###

  describe 'testing escenario', ->
    it 'foo will return as is (no-engine)', ->
      foo = tarimaFixtures('foo')

      expect(foo.partial.render()).toBe foo.result
      expect(foo.partial.compile()).toBe foo.result

    it 'foo.bar will return as is (unknown bar-engine)', ->
      foo_bar = tarimaFixtures('foo_bar')

      expect(foo_bar.partial.render()).toBe foo_bar.result
      expect(foo_bar.partial.compile()).toBe foo_bar.result

    # all-engines
    testEngine(engine) for engine in engines


    ###

      Here is my essay:

      I want to use this kind of black magic to automatize my source code.
      I want to produce my assets, configs, documents, etc. in a nice an cleaver way.
      I notice that last file's extension rule about it's content and has higher precedence.

      Then, source code will produce source code.

      There are few engines:
      - Use .js for js-source (plain old javascript) -- READY (?) --
      - Use .jade for jade-source (templating engine that produces html) -- NOT READY --
      - Use .html for html-source (plain old html-markup) -- NOT READY --
      - Use .ract for ract-source (for ractive.js) -- NOT READY --
      - Use .hbs for hbs-source (handlebars) -- NOT READY --
      - Use .us for us-source (underscore) -- NOT READY --
      - Use .eco for eco-source (embedded coffee) -- NOT READY --
      - Use .ejs for ejs-source (embedded javascript) -- NOT READY --
      - Use .coffee for coffee-source (you known) -- NOT READY --
      - Use .json for json-source (JSON data) -- NOT READY --
      - Use .less for less-source (compile down css stylesheets) -- NOT READY --
      - Use .md for md-source (plain old markdown) -- NOT READY --

      Given a posts.html.md.hbs.us file we could have a file like this:

      # <%= title || 'Untitled' %>

      {{#package}}
      >    <%= JSON.stringify(pkg) %>
      {{/package}}

      {{#links}}- [{{title}}]({{url}})
      {{/links}}

      Using data.json produces somewhat:

      {
        title: 'FU',
        links: [
          { title: 'bar', url: '#buzz' }
        ],
        pkg: { name: 'candy' }
      }

      <h1>FU</h1>
      <blockquote>
        <pre>{ "name": "candy" }<pre>
      </blockquote>
      <ul>
        <li>
          <a href="#buzz">bar</a>
        </li>
      </ul>

      Obviously you can't compile between all engines out of the box, to achieve this,
      you'll ensure which one return valid source code for each another.

      Look at src/tarima.js for more info.

    ###
