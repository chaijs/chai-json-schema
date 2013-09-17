# chai-json-schema

[![Build Status](https://secure.travis-ci.org/Bartvds/chai-json-schema.png?branch=master)](http://travis-ci.org/Bartvds/chai-json-schema) [![Dependency Status](https://gemnasium.com/Bartvds/chai-json-schema.png)](https://gemnasium.com/Bartvds/chai-json-schema) [![NPM version](https://badge.fury.io/js/chai-json-schema.png)](http://badge.fury.io/js/chai-json-schema)

[Chai](http://chaijs.com/) plugin to validate values against [JSON Schema v4](http://json-schema.org/). 

Assert both simple values and complex objects with the rich collection of [validation terms](http://json-schema.org/latest/json-schema-validation.html) ([examples](http://json-schema.org/examples.html)). 

## Notes

JSON Schema validation is done by [Tiny Validator tv4](https://github.com/geraintluff/tv4).

The assertion will fail if a schema use a `$ref` to a schema that is not added before the assertion is called. Use `chai.tv4.addSchema(uri, schema)` to preset schemas.

JSON Schema's main use-case is validating JSON documents and API responses, but it is also a powerful way to describe and validate *any* JavaScript value or object.

## Usage

### browser-side

Include chai-json-schema after [Chai](http://chaijs.com/), [Tiny Validator tv4](https://github.com/geraintluff/tv4) and [jsonpointer](https://github.com/alexeykuzmin/jsonpointer.js/):

    <script src="jsonpointer.js"></script>
    <script src="tv4.js"></script>
    <script src="chai.js"></script>
    <script src="chai-json-schema.js"></script>

### server-side

Install from npm:

    $ npm install chai-json-schema

Have chai use the chai-json-schema module:

    var chai = require('chai');
    chai.use(require('chai-json-schema'));

## Assertions

### jsonSchema(value, schema)

Validate that the given javascript value conforms to the specified JSON Schema. Both the value and schema would likely be JSON loaded from a external datasource but could also be literals or object instances.

    var goodApple = {
    	skin: "thin",
    	colors: ["red", "green", "yellow"],
    	taste: 10
    };
    var badApple = {
    	colors: ["brown"],
    	taste: 0,
    	worms: 2
    };
    var fruitSchema = {
    	"title": "fresh fruit schema v1",
    	"type": "object",
    	"required": ["skin", "colors", "taste"],
    	"properties": {
    		"colors": {
    			"type": "array",
    			"minItems": 1,
    			"uniqueItems": true,
    			"items": {
    				"type": "string"
    			}
    		},
    		"skin": {
    			"type": "string"
    		},
    		"taste": {
    			"type": "number",
    			"minimum": 5
    		}
    	}
    };
    
    //bdd style
    expect(goodApple).to.be.jsonSchema(fruitSchema);
    expect(badApple).to.not.be.jsonSchema(fruitSchema);
    
    goodApple.should.be.jsonSchema(fruitSchema);
    badApple.should.not.be.jsonSchema(fruitSchema);
    
    //tdd style
    assert.jsonSchema(goodApple, fruitSchema);
    assert.notJsonSchema(badApple, fruitSchema);

## Additional API

The `tv4` instance is 'exported' as `chai.tv4` and can be accessed to add schemas for use in validations: 

    chai.tv4.addSchema(uri, schema);

There are other useful methods:

    var list = chai.tv4.getMissingUris();
    var list = chai.tv4.getMissingUris(/^https?:/);

    var list = chai.tv4.getSchemaUris();
    var list = chai.tv4.getSchemaUris(/example.com/);
    
    var schema = chai.tv4.getSchema('http://example.com/item');
    var schema = chai.tv4.getSchema('http://example.com/item/#sub/type');
    
    chai.tv4.dropSchemas();

For more API methods and info on the validator see the [tv4 documentation](https://github.com/geraintluff/tv4#api).

### Cyclical objects

There is a non-standard tv4 property that will be passed to the internal `tv4.validateResult()` call to enable [support for cyclical objects](https://github.com/geraintluff/tv4#cyclical-javascript-objects). It allows tv4 to validate normal javascipt structures (instead of pure JSON) without risk of entering a loop on cyclical references.

    chai.tv4.cyclicCheck = true;
 
This is slightly slower then regular validation so it is disabled by default. 

### Remote references

Due to the synchronous nature of assertions there will be no support for dynamically loading remote references during validation.

Use the asynchronous preparation feature of your favourite test runner to preload remote schemas:

    // simplified example using a bdd-style async before(); 
    // as used in mocha, jasmine etc.

    before(function (done) {
    
        // iterate missing
        var checkMissing = function (callback) {
            var missing = chai.tv4.getMissingUris();
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
                chai.tv4.addSchema(uri, schema);
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
            chai.tv4.addSchema(uri, schema);

            // start checking
            checkMissing(done);
        });
    });

## History

* 1.0.6 - Update tv4 dependency, improved error formatting.
* 1.0.5 - Dropped underscore dependency, various internal tweaks. 
* 1.0.4 - Use and expose separated tv4 instance. Improved readme examples.
* 1.0.3 - Published to [chaijs.com/plugins](http://chaijs.com/plugins)
* 1.0.2 - Improved reporting, made compatible with standard reporters.

## Build

Install development dependencies in your git checkout:

    $ npm install

You need the global [grunt](http://gruntjs.com) command:

    $ npm install grunt-cli -g

Build and run tests:

    $ grunt

See the `Gruntfile` for additional commands.

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.