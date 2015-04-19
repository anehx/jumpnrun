module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      backend: {
        options: {
          jshintrc: 'backend/.jshintrc'
        }
      , files: {
          src: [ 'backend/models/*.js', 'backend/common/*.js', 'backend/app.js' ]
        }
      }
    , frontend: {
        options: {
          jshintrc: 'frontend/.jshintrc'
        }
      , files: {
          src: [ 'frontend/js/**/*.js' ]
        }
      }
    , grunt: {
        options: {
          jshintrc: '.jshintrc'
        }
      , files: {
          src: [ 'Gruntfile.js' ]
        }
      }
    }

  , jscs: {
      backend: [ 'backend/models/*.js', 'backend/common/*.js', 'backend/app.js' ]
    , frontend: [ 'frontend/js/**/*.js' ]
    , grunt: [ 'Gruntfile.js' ]
    }

  , broccoli: {
      frontend: {
        config: 'frontend/Brocfile.js'
      , dest: 'frontend/dest/'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-broccoli')

  grunt.registerTask('test', [ 'jshint', 'jscs' ])
}
