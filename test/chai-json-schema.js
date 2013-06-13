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
	});

	describe('chai-json-schema', function () {
		it('has tests', function () {
			assert.isArray(tests, 'tests');
			assert.operator(tests.length, '>', 0, 'tests.length');
		});
		_.each(tests, function (testCase) {
			describe('test ' + testCase.name, function () {
				it('has settings', function () {
					assert.isObject(testCase.schema, 'schema');
					assert.isArray(testCase.valid, 'valid');
					assert.isArray(testCase.invalid, 'invalid');
				});
			});
		});

		describe('bdd', function () {
			it('is defined', function () {
				assert.isFunction(expect(true).to.be.jsonSchema, 'expect');
				assert.isFunction({}.should.be.jsonSchema, 'should');
			});

			_.each(tests, function (testCase) {
				describe(testCase.name +' schema', function () {
					it('should/expect', function () {
						_.each(testCase.valid, function (obj, i) {
							expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #'+ i);
							obj.data.should.be.jsonSchema(testCase.schema, 'should #'+ i);
						});
					});
					it('should/expect negation', function () {
						_.each(testCase.invalid, function (obj, i) {
							expect(obj.data).to.not.be.jsonSchema(testCase.schema, 'expect() #'+ i);
							obj.data.should.not.be.jsonSchema(testCase.schema, 'should #'+ i);
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
				describe(testCase.name +' schema', function () {
					it('assert.jsonSchema()', function () {
						_.each(testCase.valid, function (obj, i) {
							assert.jsonSchema(obj.data, testCase.schema, '#'+ i);

						});
					});
					it('assert.notJsonSchema()', function () {
						_.each(testCase.invalid, function (obj, i) {
							assert.notJsonSchema(obj.data, testCase.schema, '#'+ i);
						});
					});
				});
			});
		});
	});
}));