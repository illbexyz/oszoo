module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      views: {
        expand: true,
        cwd: 'src/views/',
        src: '**',
        dest: 'dist/views/',
        filter: 'isFile',
      },
      public: {
      	expand: true,
        cwd: 'src/public/',
        src: '**',
        dest: 'dist/public/',
        filter: 'isFile',
      }
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
        },
        options : {
          beautify : true,
          mangle   : true
        }
      }
    },

    watch: {
      coffee: {
        files: ['src/**/*.coffee'],
        tasks: ['coffeelint', 'coffee',],
        options: {
          spawn: false,
        },
      },
      views: {
        files: ['src/views/**/*.jade'],
        tasks: ['copy'],
        options: {
          spawn: false,
        },
      },
      client: {
        files: ['src/client/**/*.coffee'],
        tasks: ['coffeelint', 'coffee', 'browserify'],
        options: {
          spawn: false,
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'coffeelint', 'coffee', 'browserify', 'watch']);
  grunt.registerTask('build', ['copy', 'coffeelint', 'coffee', 'browserify', 'uglify']);
};