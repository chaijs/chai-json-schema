(function (plugin) {
	if (
	typeof require === "function"
	&& typeof exports === "object"
	&& typeof module === "object"
	) {
		// NodeJS
		module.exports = plugin;
	} else if (
	typeof define === "function"
	&& define.amd
	) {
		// AMD
		define(function () {
			return plugin;
		});
	} else {
		// Other environment (usually <script> tag): plug in to global chai instance directly.
		chai.use(plugin);
	}
}(function (chai, utils) {
	var JSV;
	var assert = chai.assert;

	if (
	typeof window === "object"
	&& typeof window._ == "function"
	) {
		// browser-side
		_ = window._;
		JSV = window.JSV;
		assert.ok(JSV, 'JSV not loaded');
	} else {
		// server-side
		_ = require('json-schema');
		JSV = require('jsv').JSV;
		assert.ok(JSV, 'JSV not loaded');
	}

	env = JSV.createEnvironment("json-schema-draft-03");

	var draft = "draft-03";
	env.setOption("defaultSchemaURI", "http://json-schema.org/" + draft + "/hyper-schema#");
	env.setOption("latestJSONSchemaSchemaURI", "http://json-schema.org/" + draft + "/schema#");
	env.setOption("latestJSONSchemaHyperSchemaURI", "http://json-schema.org/" + draft + "/hyper-schema#");
	env.setOption("latestJSONSchemaLinksURI", "http://json-schema.org/" + draft + "/links#");

	chai.Assertion.addMethod('jsonSchema', function (expected) {
		var obj = this._obj;

		var expectedAsJSON = JSON.parse(JSON.stringify(expected));

		this.assert(
		_.isEqual(obj, expectedAsJSON)
		, "expected #{this} to comform to json-schema #{exp}"
		, "expected #{this} not to comform to json-schema #{exp}"
		, expectedAsJSON
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
