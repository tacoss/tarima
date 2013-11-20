module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['lib/**/*.js', 'spec/**/*.coffee'],
        tasks: ['jshint', 'jasmine_node']
      }
    },
    jshint: {
      all: ['lib/**/*.js']
    },
    jasmine_node: {
      useCoffee: true,
      extensions: 'coffee',
      projectRoot: __dirname
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'jasmine_node']);
};
