module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: [
				'Gruntfile.js',
				'index.js',
				'test/*.js',
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
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
	require('mocha-unfunk-reporter').option('style', 'ansi');

	grunt.registerTask('default', ['test']);
	grunt.registerTask('server', ['connect:test']);
	grunt.registerTask('test', ['jshint', 'mochaTest', 'mocha']);

	grunt.registerTask('edit_01', ['mochaTest']);
	grunt.registerTask('edit_02', ['mocha']);
};