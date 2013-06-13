module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');

	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			any: {
				src: ['test/**/*.test.js'],
				options: {
					reporter: 'mocha-unfunk-reporter'
				}
			}
		}
	});
	// cli commands
	grunt.registerTask('default', ['test']);
	grunt.registerTask('test', ['test-code', 'validate-data', 'validate-repo']);
};