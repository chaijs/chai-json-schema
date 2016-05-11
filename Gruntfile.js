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
      pass_amd: {
        options: {
          run: false
        },
        src: ['test/pass-amd.html']
      },
      fail: {
        src: ['test/fail.html']
      },
      fail_spec : {
        options: {
          reporter: 'Spec'
        },
        src: ['test/fail.html']
      },
      fail_amd : {
        options: {
          run: false
        },
        src: ['test/fail-amd.html']
      }
    }
  });

  grunt.registerTask('pass', ['mochaTest:pass', 'mocha:pass', 'mocha:pass_amd']);
  grunt.registerTask('fail', ['mochaTest:fail', 'mocha:fail', 'mocha:fail_amd']);

  grunt.registerTask('run', ['build', 'mochaTest']);
  grunt.registerTask('dev', ['build', 'continue:on', 'mocha:fail', 'continue:off', 'mocha:pass']);

  grunt.registerTask('edit_01', ['build', 'mochaTest:pass']);
  grunt.registerTask('edit_02', ['build', 'mochaTest:fail']);
  grunt.registerTask('edit_03', ['build', 'mocha:fail']);

  grunt.registerTask('test', ['build', 'pass', 'continue:on', 'fail', 'continue:off']);
  grunt.registerTask('build', ['jshint']);
  grunt.registerTask('default', ['test']);
};
