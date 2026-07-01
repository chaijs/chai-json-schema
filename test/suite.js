import * as chai from 'chai';
import { default as plugin, tv4 } from '../index.js';

chai.use(plugin);
chai.should();
chai.config.includeStack = true;

const expect = chai.expect;
const assert = chai.assert;

describe('chai-json-schema', function () {
  chai.use(function (chai, utils) {
    const inspect = utils.objDisplay;

    chai.Assertion.addMethod('fail', function (message) {
      const obj = this._obj;

      new chai.Assertion(obj).is.a('function');

      try {
        obj();
      } catch (err) {
        this.assert(
          err instanceof chai.AssertionError,
          message + ' expected #{this} to fail, but it threw ' + inspect(err)
        );
        return;
      }

      this.assert(false, message + ' expected #{this} to fail');
    });
  });

  describe('api', function () {
    it('exposes a live tv4 instance with expected methods', function () {
      assert.isObject(tv4, 'tv4');
      assert.isFunction(tv4.addSchema, 'tv4.addSchema');
      assert.isFunction(tv4.getMissingUris, 'tv4.getMissingUris');
      assert.isFunction(tv4.validateResult, 'tv4.validateResult');
      assert.isFunction(tv4.validateMultiple, 'tv4.validateMultiple');
      assert.isFunction(tv4.freshApi, 'tv4.freshApi');
    });
    it('jsonpointer is live: error output includes field path for invalid data', function () {
      const schema = { properties: { x: { type: 'integer' } } };
      const invalid = { x: 'not-an-int' };
      let msg = null;
      try {
        assert.jsonSchema(invalid, schema);
      } catch (err) {
        msg = err.message;
      }
      assert.ok(msg, 'expected an assertion error');
      assert.include(msg, '/x', 'jsonpointer resolved field path in error output');
    });
  });

  describe('assertions', function () {
    const tests = [
      {
        name: 'properties',
        schema: {
          properties: {
            intKey: {
              type: 'integer'
            },
            stringKey: {
              type: 'string'
            }
          }
        },
        valid: [
          {
            data: {
              intKey: 1,
              stringKey: 'one'
            }
          }
        ],
        invalid: [
          {
            data: {
              intKey: 'three',
              stringKey: false
            }
          }
        ]
      },
      {
        name: 'fruit',
        schema: {
          id: 'fruit_v1',
          description: 'fresh fruit schema v1',
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
            },
            worms: {
              type: 'number',
              maximum: 1
            }
          }
        },
        valid: [
          {
            data: {
              skin: 'thin',
              colors: ['red', 'green', 'yellow'],
              taste: 10
            }
          },
          {
            data: {
              skin: 'thin',
              colors: ['yellow'],
              taste: 5,
              worms: 1
            }
          }
        ],
        invalid: [
          {
            data: {
              skin: 'thin',
              colors: ['yellow'],
              taste: 0,
              worms: 2
            }
          },
          {
            data: {
              skin: 'thin',
              colors: [1, 2, 3],
              taste: 4
            }
          },
          {
            data: {
              skin: 321,
              colors: ['yellow', 'yellow'],
              taste: 5
            }
          },
          {
            data: {
              skin: 'thin',
              colors: ['yellow'],
              taste: 4,
              worms: 3
            }
          }
        ]
      }
    ];
    describe('check test data', function () {
      it('has tests', function () {
        assert.isArray(tests, 'tests');
        assert.operator(tests.length, '>', 0, 'tests.length');
      });

      Object.keys(tests).forEach(function (key) {
        const testCase = tests[key];
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
        const testCase = tests[key];
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
          it('should/expect output single negation', function () {
            testCase.invalid.forEach(function (obj, i) {
              expect(function () {
                expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
              }).to.throw(/(.+?\n){4}/);
              expect(function () {
                obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
              }).to.throw(/(.+?\n){4}/);
            });
          });
          describe('should/expect output multiple negation', function () {
            before(function () {
              tv4.multiple = true;
            });
            after(function () {
              tv4.multiple = false;
            });
            it('should/expect multiple negation', function () {
              testCase.invalid.forEach(function (obj, i) {
                expect(function () {
                  expect(obj.data).to.be.jsonSchema(testCase.schema, 'expect() #' + i);
                }).to.throw(/(.+?\n){5,}/);
                expect(function () {
                  obj.data.should.be.jsonSchema(testCase.schema, 'should #' + i);
                }).to.throw(/(.+?\n){5,}/);
              });
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
        const testCase = tests[key];
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
          it('should/expect output single negation', function () {
            testCase.invalid.forEach(function (obj, i) {
              expect(function () {
                assert.jsonSchema(obj.data, testCase.schema, '#' + i);
              }).to.throw(/(.+?\n){4}/);
            });
          });
          describe('should/expect output multiple negation', function () {
            before(function () {
              tv4.multiple = true;
            });
            after(function () {
              tv4.multiple = false;
            });
            it('should/expect multiple negation', function () {
              testCase.invalid.forEach(function (obj, i) {
                expect(function () {
                  assert.jsonSchema(obj.data, testCase.schema, '#' + i);
                }).to.throw(/(.+?\n){5,}/);
              });
            });
          });
        });
      });
    });
  });
});
