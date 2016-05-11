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

    var assert = chai.assert;

    describe('chai-json-schema fail demo', function () {
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
          { data: [1, 2, 3]},
          { data: {aa: 1}}
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

      // enable this to see the error reporting
      describe('bulk', function () {
        Object.keys(tests).forEach(function (key) {
          var testCase = tests[key];
          describe(testCase.name + ' schema', function () {
            it('assert.jsonSchema()', function () {
              testCase.invalid.forEach(function (obj, i) {
                assert.notJsonSchema(obj.data, testCase.schema, '#' + i);
              });
            });
          });
        });
      });
    });
  }
}());
