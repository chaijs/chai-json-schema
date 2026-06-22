import tv4Module from 'tv4';
import jsonpointer from 'jsonpointer.js';

const tv4 = tv4Module.freshApi();
tv4.cyclicCheck = false;
tv4.banUnknown = false;
tv4.multiple = false;

export { tv4 };

export default function pluginFn(chai, utils) {
  const assert = chai.assert;
  const flag = utils.flag;

  // make a compact debug string from any object
  function valueStrim(value, cutoff) {
    const strimLimit = typeof cutoff === 'undefined' ? 60 : cutoff;

    const t = typeof value;
    if (t === 'function') {
      return '[function]';
    }
    if (t === 'object') {
      value = JSON.stringify(value);
      if (value.length > strimLimit) {
        value = value.substr(0, strimLimit) + '...';
      }
      return value;
    }
    if (t === 'string') {
      if (value.length > strimLimit) {
        return JSON.stringify(value.substr(0, strimLimit)) + '...';
      }
      return JSON.stringify(value);
    }
    return '' + value;
  }

  function extractSchemaLabel(schema, max) {
    max = typeof max === 'undefined' ? 40 : max;
    let label = '';
    if (schema.id) {
      label = schema.id;
    }
    if (schema.title) {
      label += label ? ' (' + schema.title + ')' : schema.title;
    }
    if (!label && schema.description) {
      label = valueStrim(schema.description, max);
    }
    if (!label) {
      label = valueStrim(schema, max);
    }
    return label;
  }

  // print validation errors
  const formatResult = function (error, data, schema, indent) {
    let schemaValue;
    let dataValue;

    // assemble error string
    let ret = '';
    ret += '\n' + indent + error.message;

    let schemaLabel = extractSchemaLabel(schema, 60);
    if (schemaLabel) {
      ret += '\n' + indent + '    schema: ' + schemaLabel;
    }
    if (error.schemaPath) {
      schemaValue = jsonpointer.get(schema, error.schemaPath);
      ret += '\n' + indent + '    rule:   ' + error.schemaPath + ' -> ' + valueStrim(schemaValue);
    }
    if (error.dataPath) {
      dataValue = jsonpointer.get(data, error.dataPath);
      ret +=
        '\n' +
        indent +
        '    field:  ' +
        error.dataPath +
        ' -> ' +
        utils.type(dataValue) +
        ': ' +
        valueStrim(dataValue);
    }

    // sub errors are not implemented (yet?)
    // https://github.com/chaijs/chai-json-schema/issues/3
    /*if (error.subErrors) {
     forEachI(error.subErrors, function (error) {
     ret += formatResult(error, data, schema, indent + indent);
     });
     }*/
    return ret;
  };

  // add the method
  chai.Assertion.addMethod('jsonSchema', function (schema, msg) {
    if (msg) {
      flag(this, 'message', msg);
    }
    const obj = this._obj;

    // note: don't assert.ok(obj) -> zero or empty string is a valid and describable json-value
    assert.ok(schema, 'schema');

    // single result
    let result = null;
    if (tv4.multiple) {
      result = tv4.validateMultiple(obj, schema, tv4.cyclicCheck, tv4.banUnknown);
    } else {
      result = tv4.validateResult(obj, schema, tv4.cyclicCheck, tv4.banUnknown);
    }
    // assertion fails on missing schemas
    const pass = result.valid && result.missing.length === 0;

    // assemble readable message
    const label = extractSchemaLabel(schema, 30);

    // assemble error report
    let details = '';
    if (!pass) {
      const indent = '      ';
      details += " -> '" + valueStrim(obj, 30) + "'";

      if (result.error) {
        details += formatResult(result.error, obj, schema, indent);
      } else if (result.errors) {
        for (const error of result.errors) {
          details += formatResult(error, obj, schema, indent);
        }
      }

      if (result.missing.length === 1) {
        details += '\n' + 'missing 1 schema: ' + result.missing[0];
      } else if (result.missing.length > 0) {
        details += '\n' + 'missing ' + result.missing.length + ' schemas:';
        for (const missing of result.missing) {
          details += '\n' + missing;
        }
      }
    }
    // pass hardcoded strings and no actual value (mocha forces nasty string diffs)
    this.assert(
      pass,
      "expected value to match json-schema '" + label + "'" + details,
      "expected value not to match json-schema '" + label + "'" + details,
      label
    );
  });

  // export tdd style
  assert.jsonSchema = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.be.jsonSchema(exp);
  };
  assert.notJsonSchema = function (val, exp, msg) {
    new chai.Assertion(val, msg).to.not.be.jsonSchema(exp);
  };
}
