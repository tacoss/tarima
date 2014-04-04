var pad = function(n) { return ('0' + n).slice(-2); },
    now = function() { var d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      all: ['lib']
    },
    jshint: {
      all: ['lib/**/*.js']
    },
    jasmine_node: {
      all: ['spec'],
      options: {
        coffee: true,
        extensions: 'coffee'
      }
    },
    'expand-include': {
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'lib/<%= pkg.name %>.js',
        options: {
          stripHeaderOfInclude: false,
          globalDefines: {
            major: "<%= pkg.version.split('.')[0] %>",
            minor: "<%= pkg.version.split('.')[1] %>",
            micro: "<%= pkg.version.split('.')[2] %>",
            date: now()
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-expand-include');

  grunt.registerTask('default', ['clean', 'expand-include', 'jshint', 'jasmine_node']);
};
