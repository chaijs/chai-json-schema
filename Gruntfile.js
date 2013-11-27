module.exports = function (grunt) {
	'use strict';

	/* jshint -W107 */

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-continue');
	grunt.loadNpmTasks('grunt-bump');

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
		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: [],
				commit: true,
				commitMessage: 'release v%VERSION%',
				commitFiles: ['-a'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: 'release %VERSION%',
				push: false,
				pushTo: 'upstream',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
			}
		},
		mochaTest: {
			options: {
				reporter: 'mocha-unfunk-reporter'
			},
			pass: {
				src: ['test/suite.js']
			},
			fail : {
				options: {
					reporter: 'mocha-unfunk-reporter'
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
			pass: {
				src: ['test/pass.html']
			},
			fail: {
				src: ['test/fail.html']
			},
			fail_spec : {
				options: {
					reporter: 'Spec'
				},
				src: ['test/fail.html']
			}
		}
	});

	grunt.registerTask('pass', ['mochaTest:pass', 'mocha:pass']);
	grunt.registerTask('fail', ['mochaTest:fail', 'mocha:fail']);

	grunt.registerTask('run', ['build', 'mochaTest']);
	grunt.registerTask('dev', ['build', 'continueOn','mocha:fail', 'continueOff', 'mocha:pass']);

	grunt.registerTask('edit_01', ['build', 'mochaTest:pass']);
	grunt.registerTask('edit_02', ['build', 'mochaTest:fail']);
	grunt.registerTask('edit_03', ['build', 'mocha:fail']);

	grunt.registerTask('test', ['build', 'pass', 'continueOn', 'fail', 'continueOff']);
	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('default', ['test']);
};
