module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      client: {
        expand: true,
        cwd: 'src/views/',
        src: '**',
        dest: 'dist/views/',
        filter: 'isFile',
      },
    },

    coffeelint: {
      app: ['src/**/*.coffee']
    },

    coffee: {
      glob_to_multiple: {
        expand: true,
        flatten: false,
        cwd: 'src/',
        src: ['**/*.coffee'],
        dest: 'dist/',
        ext: '.js'
      }
    },

    browserify: {
      client: {
        src: 'dist/client/app.js',
        dest: 'dist/public/javascripts/oszoo.js',
      }
    },

    uglify: {
      client: {
        files: {
          'dist/public/javascripts/oszoo.js': ['dist/public/javascripts/oszoo.js']
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'coffeelint', 'coffee', 'browserify']);
};