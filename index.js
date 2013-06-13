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
	var tv4;

	if (typeof window === 'object' && typeof document === 'object') {
		// browser-side
		_ = window._;
		tv4 = window.tv4;
	} else {
		// server-side
		_ = require('underscore');
		tv4 = require('tv4').tv4;
	}
	assert.ok(_, 'underscore not loaded');
	assert.ok(tv4, 'tv4 not loaded');

	chai.Assertion.addMethod('jsonSchema', function (expected) {
		var obj = this._obj;

		assert.ok(obj, 'obj');
		assert.ok(expected, 'expected');

		var result = tv4.validateResult(obj, expected);

		//console.log(utils.inspect(result));

		this.assert(
			result.valid
			, 'expected #{this} to comform to json-schema #{exp}'
			, 'expected #{this} not to comform to json-schema #{exp}'
			, expected
			, obj
			, true
		)
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
