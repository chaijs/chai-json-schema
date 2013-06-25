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
	var tv4, jsonpointer;

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
	assert.ok(_, 'underscore not loaded');
	assert.ok(tv4, 'tv4 not loaded');
	assert.ok(jsonpointer, 'jsonpointer not loaded');

	var valueType = function (value) {
		var t = typeof value;
		if (t === 'object') {
			if (Object.prototype.toString.call(value) === '[object Array]') {
				return 'array';
			}
		}
		return t;
	};

	var valueStrim = function (value) {
		var t = typeof value;
		if (t === 'function') {
			return '[function]';
		}
		if (t === 'object') {
			//return Object.prototype.toString.call(value);
			value = JSON.stringify(value);
			if (value.length > 40) {
				value = value.substr(0, 37) + '...';
			}
			return value;
		}
		if (t === 'string') {
			if (value.length > 40) {
				return JSON.stringify(value.substr(0, 37)) + '...';
			}
			return JSON.stringify(value);
		}
		return '' + value;
	};

	var printError = function (error, data, schema, indent) {
		//grunt.log.writeln(util.inspect(error, false, 4));
		var value = jsonpointer.get(data, error.dataPath);
		var schema = jsonpointer.get(schema, error.schemaPath);
		var ret = '';
		ret += '\n' + indent + error.message;
		ret += '\n' + indent + '    field:  ' + error.dataPath;
		ret += '\n' + indent + '    value:  ' + valueType(value) + ' -> ' + valueStrim(value);
		ret += '\n' + indent + '    schema: ' + schema + ' -> ' + error.schemaPath;

		_.each(error.subErrors, function (f) {
			ret += printError(indent + indent);
		});
		return ret;
	};

	chai.Assertion.addMethod('jsonSchema', function (schema) {
		var obj = this._obj;

		assert.ok(obj, 'obj');
		assert.ok(schema, 'schema');

		var result = tv4.validateResult(obj, schema);
		//console.log(utils.inspect(result));
		var pass = result.valid && result.missing.length === 0;

		var details = '';
		if (!pass) {
			if (result.errors) {
				_.each(result.errors, function (error) {
					details += printError(error, obj, schema, '      ');
				});
			}
			else if (result.error) {
				details += printError(result.error, obj, schema, '      ');
			}
			if (result.missing.length > 0) {
				details += '\n' + 'missing schemas:';
				_.each(result.missing, function (missing) {
					details += '\n' + missing;
				});
			}
		}

		this.assert(
			pass
			, 'expected #{this} to comform to json-schema #{exp}' + details
			, 'expected #{this} not to comform to json-schema #{exp}' + details
			, schema
		);
	});

	//export tdd style
	var assert = chai.assert;
	assert.jsonSchema = function (val, exp, msg) {
		new chai.Assertion(val, msg).to.be.jsonSchema(exp);
	};
	assert.notJsonSchema = function (val, exp, msg) {
		new chai.Assertion(val, msg).to.not.be.jsonSchema(exp);
	};
}));
