(function () {
	'use strict';
	/*jshint -W003*/
	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		// NodeJS
		getPayload(require('chai'), require('../index'));
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define([
			'chai',
			'chai-json-schema',
		], function (chai, plugin) {
			return getPayload(chai, plugin);
		});
	} else {
		// Other environment (usually <script> tag): plug in to global chai instance directly.
		return getPayload(window.chai, null);
	}

	function getPayload(chai, plugin) {
		if (plugin) {
			chai.use(plugin);
		}
		chai.should();
		chai.Assertion.includeStack = true;

		var expect = chai.expect;
		var assert = chai.assert;

		describe('chai-json-schema', function () {
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
						return;
					}

					this.assert(false, message + ' expected #{this} to fail');
				});
			});

			describe('api', function () {
				it('exports tv4', function () {
					assert.isObject(chai.tv4, 'chai.tv4');
					// check some methods
					assert.isFunction(chai.tv4.addSchema, 'chai.tv4.addSchema');
					assert.isFunction(chai.tv4.getMissingUris, 'chai.tv4.getMissingUris');
				});
			});

			describe('assertions', function () {
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
				tests.push({
					name: 'fruit',
					schema: {
						"id": "fruit_v1",
						"description": "fresh fruit schema v1",
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
							},
							"worms": {
								"type": "number",
								"maximum": 1
							}
						}
					},
					valid: [
						{ data: {
							skin: "thin",
							colors: ["red", "green", "yellow"],
							taste: 10
						}},
						{ data: {
							skin: "thin",
							colors: ["yellow"],
							taste: 5,
							worms: 1
						}}
					],
					invalid: [
						{ data: {
							skin: "thin",
							colors: ["yellow"],
							taste: 0
						}},
						{ data: {
							skin: "thin",
							colors: [1, 2, 3],
							taste: 5
						}},
						{ data: {
							skin: 321,
							colors: ["yellow"],
							taste: 5
						}},
						{ data: {
							skin: "thin",
							colors: ["yellow"],
							taste: 5,
							worms: 3
						}}
					]
				});
				describe('check test data', function () {
					it('has tests', function () {
						assert.isArray(tests, 'tests');
						assert.operator(tests.length, '>', 0, 'tests.length');
					});

					Object.keys(tests).forEach(function (key) {
						var testCase = tests[key];
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
				});

				describe('bdd', function () {

					it('is defined', function () {
						assert.isFunction(expect(true).to.be.jsonSchema, 'expect jsonSchema');
						assert.isFunction({}.should.be.jsonSchema, 'should jsonSchema');
					});

					Object.keys(tests).forEach(function (key) {
						var testCase = tests[key];
						describe(testCase.name + ' schema', function () {
							it('should/expect', function () {
								testCase.valid.forEach(function (obj, i) {
									expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
									obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
								});
							});
							it('should/expect negation', function () {
								testCase.invalid.forEach(function (obj, i) {
									expect(obj.data).to.not.be.jsonSchema(testCase.schema, 'expect() #' + i);
									obj.data.should.not.be.jsonSchema(testCase.schema, 'should #' + i);
								});
							});

							it('should/expect fails on invalid', function () {
								testCase.invalid.forEach(function (obj, i) {
									expect(function () {
										expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
										obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
									}).to.fail('#' + i);
								});
							});

							it('should/expect fails negation on valid', function () {
								testCase.valid.forEach(function (obj, i) {
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

					Object.keys(tests).forEach(function (key) {
						var testCase = tests[key];
						describe(testCase.name + ' schema', function () {
							it('assert.jsonSchema()', function () {
								testCase.valid.forEach(function (obj, i) {
									assert.jsonSchema(obj.data, testCase.schema, '#' + i);
								});
							});
							it('assert.notJsonSchema()', function () {
								testCase.invalid.forEach(function (obj, i) {
									assert.notJsonSchema(obj.data, testCase.schema, '#' + i);
								});
							});

							it('assert.jsonSchema() fails on invalid', function () {
								testCase.invalid.forEach(function (obj, i) {
									expect(function () {
										assert.jsonSchema(obj.data, testCase.schema, '#' + i);
									}).to.fail('#' + i);
								});
							});

							it('assert.notJsonSchema() fails on valid', function () {
								testCase.valid.forEach(function (obj, i) {
									expect(function () {
										assert.notJsonSchema(obj.data, testCase.schema, '#' + i);
									}).to.fail('#' + i);
								});
							});
						});
					});
				});
			});
		});
	}
}());
