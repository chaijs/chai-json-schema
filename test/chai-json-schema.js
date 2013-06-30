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
		var _, tv4;
		if (testingServer) {
			chai.use(require('../index'));
			_ = require('underscore');
			tv4 = require('tv4').tv4;
		}
		else {
			_ = window._;
			tv4 = window.tv4;
		}
		chai.should();
		var expect = chai.expect;
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

		describe('missing schema', function () {
			it('will fail the assertion', function () {
				var schema = {
					"items": {"$ref": "http://example.com/schema#"}
				};
				expect(function () {
					assert.jsonSchema([1, 2, 3], schema, 'assert value');
				}).to.fail('assert failure');
			});
			it('will pass after adding the schema', function () {
				var schema = {
					"items": {"$ref": "http://example.com/schema#"}
				};
				tv4.addSchema("http://example.com/schema", {});
				assert.jsonSchema([1, 2, 3], schema, 'assert value');
			});
		});

		// enable this to see the error reporting
		describe.skip('fail demo', function () {
			it('equal', function () {
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
