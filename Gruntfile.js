module.exports = function (grunt) {
	'use strict';

	var path = require('path');
	var util = require('util');

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mochaTest: {
			any: {
				src: ['test/*.js'],
				options: {
					reporter: 'mocha-unfunk-reporter'
				}
			}
		},
		mocha: {
			src: ['test/*.html'],
			options: {
				bail: true,
				log: true,
				mocha: {
					ignoreLeaks: false
				},
				reporter: 'mocha-unfunk-reporter',
				run: true
			}
		},
		connect: {
			test: {
				options: {
					port: 9001,
					base: '',
					keepalive: true
				}
			}
		}
	});
	// cli commands
	grunt.registerTask('default', ['test']);
	grunt.registerTask('server', ['connect:test']);
	grunt.registerTask('test', ['mochaTest', 'mocha']);

	grunt.registerTask('edit_01', ['mochaTest']);
	grunt.registerTask('edit_02', ['mocha']);
};