# chai-json-schema

[![Build Status](https://secure.travis-ci.org/gruntjs/grunt-cli.png?branch=master)](http://travis-ci.org/gruntjs/grunt-cli) [![Dependency Status](https://gemnasium.com/Bartvds/chai-json-schema.png)](https://gemnasium.com/Bartvds/chai-json-schema) [![NPM version](https://badge.fury.io/js/chai-json-schema.png)](http://badge.fury.io/js/chai-json-schema)

Assertions for [chai](http://chaijs.com/) to validate values against IETF [json-schema](http://json-schema.org/)

Use [json-schema draft v04](http://json-schema.org/latest/json-schema-core.html) as implemented by [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate both simple and complex objects formats with the rich and detailed collection of IETF standardised [validation terms](http://json-schema.org/latest/json-schema-validation.html). 

## Notes

Due to the synchronous nature of assertions there will be no support for *dynamically* loading remote references, but since the `tv4` instance is persistent you should be able preload the reference lookup using `tv4.addSchema(uri, schema)`.

## Usage

### browser-side

Include chai-json-schema after [chai](http://chaijs.com/), [Tiny Validator tv4](https://github.com/geraintluff/tv4), [jsonpointer.js](https://github.com/alexeykuzmin/jsonpointer.js/) and [Underscore.js](http://underscorejs.org/):

    <script src="underscore.js"></script>
    <script src="tv4.js"></script>
    <script src="jsonpointer.js"></script>
    <script src="chai.js"></script>
    <script src="chai-json-schema.js"></script>

### server-side

Have chai use the chai-json-schema module:

    var chai = require('chai');
    chai.use(require('chai-json-schema'));

## Assertions

### jsonSchema(value, schema)

Validate that the given javascript value conforms to the specified json-schema. Both the value and schema would likely be JSON loaded from a external datasource but could also be literals or object instances.

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
		"properties": {
			"required": ["skin", "colors", "taste"],
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

## History

* 1.0.2 - Improved reporting, usable with standard reporters
* 1.0.1 - Added basic validation error reporting
* 1.0.0 - First release (without schema reference lookup)

## License

Copyright (c) 2013 Bart van der Schoor
Licensed under the MIT license.