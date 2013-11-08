(function (test) {
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// NodeJS
		(function () {
			var chai = require('chai');
			test(chai, true);
		}());
	} else {
		// Other environment (usually <script> tag): plug in to global chai instance directly.
		test(chai, false);
	}
}(function (chai, testingServer) {

	describe('chai-json-schema fail demo', function () {
		var _;
		if (testingServer) {
			chai.use(require('../index'));
			_ = require('underscore');
		}
		else {
			_ = window._;
		}
		chai.should();
		chai.Assertion.includeStack = true;
		var assert = chai.assert;

		chai.use(function (chai, utils) {
			var inspect = utils.objDisplay;

			chai.Assertion.addMethod('fail', function (message) {
				var obj = this._obj;

				new chai.Assertion(obj).is.a('function');

				try {
					obj();
				} catch (err) {
					this.assert(
						err instanceof chai.AssertionError
						, message + ' expected #{this} to fail, but it threw ' + inspect(err));
					/*this.assert(
					 err.message === message
					 , 'expected #{this} to fail with ' + inspect(message) + ', but got ' + inspect(err.message));*/
					return;
				}

				this.assert(false, message + ' expected #{this} to fail');
			});
		});
		var tests = [];
		tests.push({
			name: 'properties',
			schema: {
				"properties": {
					"intKey": {
						"type": "integer"
					},
					"stringKey": {
						"type": "string"
					}
				}
			},
			valid: [
				{ data: {
					"intKey": 1,
					"stringKey": "one"
				}}
			],
			invalid: [
				{data: {
					"intKey": 3,
					"stringKey": false
				}}
			]
		}, {
			name: 'combinations',
			schema: {
				"id": "any_v1",
				"anyOf": [
					{"type": "integer"},
					{"type": "string"}
				]
			},
			valid: [
				{ data: 1},
				{ data: "yo"}
			],
			invalid: [
				{ data: [1,2,3]},
				{ data: {aa:1}}
			]
		}, {
			name: 'fruit',
			schema: {
				"id": "fruit_v1",
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
			},
			valid: [
				{ data: {
					skin: "thin",
					colors: ["red", "green", "yellow"],
					taste: 10
				}}
			],
			invalid: [
				{data: {
					colors: ["brown"],
					taste: 0,
					worms: 2
				}}
			]
		});

		it('has tests', function () {
			assert.isArray(tests, 'tests');
			assert.operator(tests.length, '>', 0, 'tests.length');
		});

		_.each(tests, function (testCase) {
			describe('test ' + testCase.name, function () {
				it('has settings', function () {
					assert.isObject(testCase.schema, 'schema');

					assert.isArray(testCase.valid, 'valid');
					assert.operator(testCase.valid.length, '>', 0, 'valid.length');

					assert.isArray(testCase.invalid, 'invalid');
					assert.operator(testCase.invalid.length, '>', 0, 'invalid.length');
				});
			});
		});

		// enable this to see the error reporting
		describe('bulk', function () {

			_.each(tests, function (testCase) {
				describe(testCase.name + ' schema', function () {
					it('assert.jsonSchema()', function () {
						_.each(testCase.invalid, function (obj, i) {
							assert.jsonSchema(obj.data, testCase.schema, '#' + i);
						});
					});
				});
			});
		});
	});
}));
