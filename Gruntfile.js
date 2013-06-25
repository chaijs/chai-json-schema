module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			options: {
				reporter: 'mocha-unfunk-reporter'
			},
			any: {
				src: ['test/*.js']
			}
		},
		mocha: {
			options: {
				bail: true,
				log: true,
				mocha: {
					ignoreLeaks: false
				},
				reporter: 'mocha-unfunk-reporter',
				run: true
			},
			any: {
				src: ['test/*.html']
			}
		}
	});
	require('mocha-unfunk-reporter').option('color', true);
	// cli commands
	grunt.registerTask('default', ['test']);
	grunt.registerTask('server', ['connect:test']);
	grunt.registerTask('test', ['mochaTest', 'mocha']);

	grunt.registerTask('edit_01', ['mochaTest']);
	grunt.registerTask('edit_02', ['mocha']);
};