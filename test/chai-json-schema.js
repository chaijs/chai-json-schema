(function (test) {
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// NodeJS
		(function () {
			var chai = require('chai');
			chai.Assertion.includeStack = true;
			test(chai, true);
		}());
	} else {
		// Other environment (usually <script> tag): plug in to global chai instance directly.
		test(chai, false);
	}
}(function (chai, testingServer) {

	describe('chai-json-schema', function () {

		var _;
		if (testingServer) {
			chai.use(require('../index'));
			_ = require('underscore');
		}
		else {
			_ = window._;
		}
		var should = chai.should();
		var expect = chai.expect;
		var assert = chai.assert;

		chai.use(function (chai, utils) {
			inspect = utils.objDisplay;

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
		//validate data
		var dataSchema = {
			"$schema": "http://json-schema.org/draft-04/schema#",
			"id": "http://chai-json-schema.xyz/",
			"required": [ "/" ],
			"type": "array",
			"minItems": 1,
			"items": {
				"type": "object",
				"required": ["name", "schema", "invalid", "valid"],
				"properties": {
					"name": {
						"type": "string"
					},
					"schema": {
						"type": "object",
						"comment": "need remote references to map this to draft v04!"
					},
					"invalid": {
						"type": "array",
						"$ref": "/dataList"
					},
					"valid": {
						"type": "array",
						"$ref": "/dataList"
					}
				}
			},
			"definitions": {
				"data": {
					"id": "dataList",
					"type": "array",
					"minItems": 21,
					"items": {
						"type": "object",
						"required": ["data"],
						"properties": {
							"data": {
								"type": "object"
							}
						}
					}
				}
			}
		};

		// why not self-host, dogfooding style?
		// - "yo dawg! I heard you like schema validation using a validation schema so i put some validation schema schema validation in your schema validation validation."
		it('self tests', function () {
			//assert.jsonSchema(tests, dataSchema);
		});

		// old skool
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

		describe('bdd', function () {

			it('is defined', function () {
				assert.isFunction(expect(true).to.be.jsonSchema, 'expect jsonSchema');
				assert.isFunction({}.should.be.jsonSchema, 'should jsonSchema');
			});

			_.each(tests, function (testCase) {
				describe(testCase.name + ' schema', function () {
					it('should/expect', function () {
						_.each(testCase.valid, function (obj, i) {
							expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
							obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
						});
					});
					it('should/expect negation', function () {
						_.each(testCase.invalid, function (obj, i) {
							expect(obj.data).to.not.be.jsonSchema(testCase.schema, 'expect() #' + i);
							obj.data.should.not.be.jsonSchema(testCase.schema, 'should #' + i);
						});
					});

					it('should/expect fails on invalid', function () {
						_.each(testCase.invalid, function (obj, i) {
							expect(function () {
								expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
								obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
							}).to.fail('#' + i);
						});
					});

					it('should/expect fails negation on valid', function () {
						_.each(testCase.valid, function (obj, i) {
							expect(function () {
								expect(obj.data).to.not.be.jsonSchema(testCase.schema, 'expect() #' + i);
								obj.data.should.not.be.jsonSchema(testCase.schema, 'should #' + i);
							}).to.fail('#' + i);
						});
					});
				});
			});
		});
		describe('tdd', function () {
			it('is defined', function () {
				assert.isFunction(assert.jsonSchema, 'jsonSchema');
				assert.isFunction(assert.notJsonSchema, 'notJsonSchema');
			});

			_.each(tests, function (testCase) {
				describe(testCase.name + ' schema', function () {
					it('assert.jsonSchema()', function () {
						_.each(testCase.valid, function (obj, i) {
							assert.jsonSchema(obj.data, testCase.schema, '#' + i);
						});
					});
					it('assert.notJsonSchema()', function () {
						_.each(testCase.invalid, function (obj, i) {
							assert.notJsonSchema(obj.data, testCase.schema, '#' + i);
						});
					});

					it('assert.jsonSchema() fails on invalid', function () {
						_.each(testCase.invalid, function (obj, i) {
							expect(function () {
								assert.jsonSchema(obj.data, testCase.schema, '#' + i);
							}).to.fail('#' + i);
						});
					});

					it('assert.notJsonSchema() fails on valid', function () {
						_.each(testCase.valid, function (obj, i) {
							expect(function () {
								assert.notJsonSchema(obj.data, testCase.schema, '#' + i);
							}).to.fail('#' + i);
						});
					});
				});
			});
		});

		describe.skip('fail', function () {
			it('equal', function() {
				assert.equal('bleh', 'blah', 'check equality');
			});
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
