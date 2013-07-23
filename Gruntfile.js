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
				reporter: './node_modules/jshint-path-reporter',
				jshintrc: '.jshintrc'
			}
		},
		mochaTest: {
			options: {
				reporter: 'mocha-unfunk-reporter'
			},
			pass: {
				src: ['test/suite.js']
			},
			spec : {
				options: {
					reporter: 'Spec'
				},
				src: ['test/*.js']
			},
			fail : {
				options: {
					reporter: 'Spec'
				},
				src: ['test/fail.js']
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

	grunt.registerTask('default', ['test']);
	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('test', ['build', 'mochaTest:pass', 'mocha']);
	grunt.registerTask('run', ['build', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'mochaTest:spec']);

	grunt.registerTask('edit_01', ['build', 'mochaTest']);
	grunt.registerTask('edit_02', ['build', 'mocha']);
};