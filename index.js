(function (plugin) {
	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		// NodeJS
		module.exports = plugin;
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(function () {
			return plugin;
		});
	} else {
		// Other environment (usually <script> tag): plug in to global chai instance directly.
		chai.use(plugin);
	}
}(function (chai, utils) {

	var assert = chai.assert;
	var tv4, _, jsonpointer;

	if (typeof window === 'object' && typeof document === 'object') {
		// browser-side
		_ = window._;
		tv4 = window.tv4;
		jsonpointer = window.jsonpointer;
	} else {
		// server-side
		_ = require('underscore');
		tv4 = require('tv4').tv4;
		jsonpointer = require('jsonpointer.js');
	}

	//check if we have all dependencies
	assert.ok(_, 'underscore dependency');
	assert.ok(tv4, 'tv4 dependency');
	assert.ok(jsonpointer, 'jsonpointer dependency');

	//make a compact debug string from any object
	var valueStrim = function (value, cutoff) {
		var strimLimit = typeof cutoff === 'undefined' ? 60 : cutoff;

		var t = typeof value;
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
	};

	//print validation errors
	var printError = function (error, data, schema, indent) {
		var schemaValue = jsonpointer.get(schema, error.schemaPath);
		var dataValue;

		//assemble error string
		var ret = '';
		ret += '\n' + indent + error.message;
		if (error.dataPath) {
			dataValue = jsonpointer.get(data, error.dataPath);
			ret += '\n' + indent + '    field:  ' + error.dataPath;
			ret += '\n' + indent + '    value:  ' + utils.type(dataValue) + ' -> ' + valueStrim(dataValue);
		}
		ret += '\n' + indent + '    schema: ' + schemaValue + ' -> ' + error.schemaPath;

		//go deeper
		/*_.each(error.subErrors, function (error) {
		 ret += printError(error, data, schema, indent + indent);
		 });*/
		return ret;
	};

	//add the method
	chai.Assertion.addMethod('jsonSchema', function (schema) {
		var obj = this._obj;

		//note: don't assert.ok(obj) -> zero or empty string is a valid and describable json-value
		assert.ok(schema, 'schema');

		//single result
		var result = tv4.validateResult(obj, schema);
		//assertion fails on missing schemas
		var pass = result.valid && result.missing.length === 0;

		//assemble readable message
		var label;
		if (schema.id) {
			label = schema.id;
		}
		if (schema.title) {
			label += (label ? ' (' + schema.title + ')' : schema.title);
		}
		if (!label && schema.description) {
			label = valueStrim(schema.description, 30);
		}
		if (!label) {
			label = valueStrim(schema, 30);
		}
		//assemble error report
		var details = '';
		if (!pass) {
			var indent = '      ';
			details += ' -> \'' + valueStrim(obj, 30) + '\'';

			if (result.error) {
				details += printError(result.error, obj, schema, indent);
			}
			else if (result.errors) {
				_.each(result.errors, function (error) {
					details += printError(error, obj, schema, indent);
				});
			}

			if (result.missing.length == 1) {
				details += '\n' + 'missing 1 schema: ' + result.missing[0];
			}
			else if (result.missing.length > 0) {
				details += '\n' + 'missing ' + result.missing.length + ' schemas:';
				_.each(result.missing, function (missing) {
					details += '\n' + missing;
				});
			}
		}
		//pass hardcoded strings and no actual value (mocha forces nasty string diffs)
		this.assert(
			pass
			, 'expected value to match json-schema \'' + label + '\'' + details
			, 'expected value not to match json-schema \'' + label + '\'' + details
			, label
		);
	});

	//export tdd style
	assert.jsonSchema = function (val, exp, msg) {
		new chai.Assertion(val, msg).to.be.jsonSchema(exp);
	};
	assert.notJsonSchema = function (val, exp, msg) {
		new chai.Assertion(val, msg).to.not.be.jsonSchema(exp);
	};
}));
