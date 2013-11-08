module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-continue');

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
					reporter: 'mocha-unfunk-reporter'
				},
				src: ['test/fail.js']
			},
			fail_spec : {
				options: {
					reporter: 'Spec'
				},
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

	grunt.registerTask('pass', ['mochaTest:pass', 'mocha', 'mochaTest:spec']);
	grunt.registerTask('fail', ['mochaTest:fail', 'mochaTest:fail_spec']);

	grunt.registerTask('run', ['build', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'mochaTest:spec']);

	grunt.registerTask('edit_01', ['build', 'mochaTest:pass']);
	grunt.registerTask('edit_02', ['build', 'mochaTest:fail']);
	grunt.registerTask('edit_03', ['build', 'mocha']);

	grunt.registerTask('test', ['build', 'pass', 'continueOn', 'fail', 'continueOff']);
	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('default', ['test']);
};