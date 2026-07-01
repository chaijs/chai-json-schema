# chai-json-schema

[![npm version](https://img.shields.io/npm/v/chai-json-schema.svg?style=flat-square)](https://www.npmjs.com/package/chai-json-schema)
[![CI](https://github.com/chaijs/chai-json-schema/actions/workflows/ci.yml/badge.svg)](https://github.com/chaijs/chai-json-schema/actions/workflows/ci.yml)
[![downloads](https://img.shields.io/npm/dm/chai-json-schema.svg?style=flat-square)](https://www.npmjs.com/package/chai-json-schema)
[![license](https://img.shields.io/npm/l/chai-json-schema.svg?style=flat-square)](./LICENSE-MIT)

> [Chai](http://chaijs.com/) plugin with assertions to validate values against [JSON Schema v4](http://json-schema.org/).

Assert both simple values and complex objects with the rich collection of [validation terms](http://json-schema.org/latest/json-schema-validation.html) ([examples](http://json-schema.org/examples.html)).

For general help with json-schema see this excellent [guide](http://spacetelescope.github.io/understanding-json-schema/) and usable [reference](http://spacetelescope.github.io/understanding-json-schema/reference/index.html).

## Status

Maintained on a low-frequency basis. The 2.x line supports chai 5 and 6 and changes how the bundled `tv4` instance is exposed; see the [changelog](./CHANGELOG.md) if you are upgrading from 1.x.

## Compatibility

|                | Supported                                             |
| -------------- | ----------------------------------------------------- |
| Node (runtime) | `>= 20` (per `engines.node`; CI tested on 20, 22, 24) |
| chai (peer)    | `>= 5` (chai 5 and 6)                                 |
| JSON Schema    | draft-04 (via `tv4`)                                  |

## Notes

JSON Schema validation is done by [Tiny Validator tv4](https://github.com/geraintluff/tv4). tv4 is unmaintained and only supports JSON Schema draft-04. If you need newer drafts or better performance, [`chai-json-schema-ajv`](https://github.com/chaijs/chai-json-schema-ajv) is the `ajv`-backed successor plugin.

The assertion will fail if a schema uses a `$ref` to a schema that is not added before the assertion is called. Use `chaiJsonSchema.tv4.addSchema(uri, schema)` to preset schemas.

JSON Schema's main use-case is validating JSON documents and API responses, but it is also a powerful way to describe and validate _any_ JavaScript value or object.

## Usage

Install from npm:

```bash
npm install chai-json-schema
```

Register the plugin with chai. Keep a reference to the plugin if you want to configure the bundled `tv4` instance (see [Additional API](#additional-api)):

```js
const chai = require('chai');
const chaiJsonSchema = require('chai-json-schema');

chai.use(chaiJsonSchema);
```

## Assertions

### jsonSchema(value, schema)

Validate that the given javascript value conforms to the specified JSON Schema. Both the value and schema would likely be JSON loaded from an external datasource but could also be literals or object instances.

```js
var goodApple = {
  skin: 'thin',
  colors: ['red', 'green', 'yellow'],
  taste: 10
};
var badApple = {
  colors: ['brown'],
  taste: 0,
  worms: 2
};
var fruitSchema = {
  title: 'fresh fruit schema v1',
  type: 'object',
  required: ['skin', 'colors', 'taste'],
  properties: {
    colors: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: {
        type: 'string'
      }
    },
    skin: {
      type: 'string'
    },
    taste: {
      type: 'number',
      minimum: 5
    }
  }
};

// bdd style
expect(goodApple).to.be.jsonSchema(fruitSchema);
expect(badApple).to.not.be.jsonSchema(fruitSchema);

goodApple.should.be.jsonSchema(fruitSchema);
badApple.should.not.be.jsonSchema(fruitSchema);

// tdd style
assert.jsonSchema(goodApple, fruitSchema);
assert.notJsonSchema(badApple, fruitSchema);
```

## Additional API

The `tv4` instance is exported as `chaiJsonSchema.tv4` and can be accessed to add schemas for use in validations:

```js
chaiJsonSchema.tv4.addSchema(uri, schema);
```

There are other useful methods:

```js
var list = chaiJsonSchema.tv4.getMissingUris();
var list = chaiJsonSchema.tv4.getMissingUris(/^https?:/);

var list = chaiJsonSchema.tv4.getSchemaUris();
var list = chaiJsonSchema.tv4.getSchemaUris(/example.com/);

var schema = chaiJsonSchema.tv4.getSchema('http://example.com/item');
var schema = chaiJsonSchema.tv4.getSchema('http://example.com/item/#sub/type');

chaiJsonSchema.tv4.dropSchemas();
```

For more API methods and info on the validator see the [tv4 documentation](https://github.com/geraintluff/tv4#api).

### Non-standard tv4 properties

**Cyclical objects**

This will be passed to the internal `tv4` validate call to enable [support for cyclical objects](https://github.com/geraintluff/tv4#cyclical-javascript-objects). It allows tv4 to validate normal javascript structures (instead of pure JSON) without risk of entering a loop on cyclical references.

```js
chaiJsonSchema.tv4.cyclicCheck = true;
```

This is slightly slower than regular validation so it is disabled by default.

**Ban unknown properties**

```js
chaiJsonSchema.tv4.banUnknown = true;
```

Passed to the internal `tv4` validate call, makes validation fail on unknown schema properties. Use this to make sure your schema does not contain undesirable data.

**Validate multiple errors**

```js
chaiJsonSchema.tv4.multiple = true;
```

Calls `tv4.validateMultiple` for validation instead of `tv4.validateResult`. Use this if you want to see all validation errors.

### Remote references

Due to the synchronous nature of assertions there is no support for dynamically loading remote references during validation.

Use the asynchronous preparation feature of your test runner to preload remote schemas:

```js
// simplified example using a bdd-style async before();
// as used in mocha, jasmine etc.

before(function (done) {
  // iterate missing
  var checkMissing = function (callback) {
    var missing = chaiJsonSchema.tv4.getMissingUris();
    if (missing.length === 0) {
      // all $ref's solved
      callback();
      return;
    }
    // load a schema using your favourite JSON loader
    // (jQuery, request, SuperAgent etc)
    var uri = missing.pop();
    myFavoriteJsonLoader.load(uri, function (err, schema) {
      if (err || !schema) {
        callback(err || 'no data loaded');
        return;
      }
      // add it
      chaiJsonSchema.tv4.addSchema(uri, schema);
      // iterate
      checkMissing(callback);
    });
  };

  // load first instance manually
  myFavoriteJsonLoader.load(uri, function (err, schema) {
    if (err || !schema) {
      done(err || 'no data loaded');
      return;
    }
    // add it
    chaiJsonSchema.tv4.addSchema(uri, schema);

    // start checking
    checkMissing(done);
  });
});
```

## History

See [Releases](https://github.com/chaijs/chai-json-schema/releases).

## Development

In a git checkout:

```bash
npm install
npm test
```

`npm test` runs ESLint, the Prettier format check, and both Mocha suites (passing assertions and failing-on-purpose assertions). CI runs the same flow on Node 20, 22 and 24.

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.
