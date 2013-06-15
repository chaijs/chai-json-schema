# chai-json-schema
[![Dependency Status](https://gemnasium.com/Bartvds/chai-json-schema.png)](https://gemnasium.com/Bartvds/chai-json-schema)

Assertions for [chai](http://chaijs.com/) to validate values against IETF [json-schema](http://json-schema.org/)

Use [json-schema draft v04](http://json-schema.org/latest/json-schema-core.html) as implemented by [Tiny Validator tv4](https://github.com/geraintluff/tv4) to validate both simple and complex objects formats with the rich and detailed collection of standardised [validation terms](http://json-schema.org/latest/json-schema-validation.html). 

Due to the nature of test assertions there will be no support for *dynamically*  loading remote references, but I'm looking into exposing tv4's `addSchema(uri, schema)` feature so you can preset the reference lookup. 

Since most testing frameworks support an async test/suite initialisation step I might add a convenient reference preloader using something like jquery, request.js or superagent.

## Usage

### browser-side

Include chai-json-schema after [chai](http://chaijs.com/), [Tiny Validator tv4](https://github.com/geraintluff/tv4) and [Underscore.js](http://underscorejs.org/):

    <script src="underscore.js"></script>
    <script src="tv4.js"></script>
    <script src="chai.js"></script>
    <script src="chai-json-schema.js"></script>

### server-side

Have chai use the chai-json-schema module:

    var chai = require('chai');
    chai.use(require('chai-json-schema'));

## Assertions

### jsonSchema(value, schema)

Validate that the given javascript value is a valid instance of the specified json-schema. Both the value and schema would likely be loaded from a external datasource but could also be literals or generated data.

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
		"description": "fresh fruit schema v1",
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

* 1.0.0 - First release (without schema reference lookup)

## License

Copyright (c) 2013 Bart van der Schoor
Licensed under the MIT license.