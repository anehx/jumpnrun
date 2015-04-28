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
      prod: {
        dest: 'frontend/dist'
      , env: 'production'
      }
    , dev: {
        host: '0.0.0.0'
      , port: 4200
      , env: 'development'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-broccoli')

  grunt.registerTask('build-frontend', 'broccoli:prod:build')
  grunt.registerTask('serve-frontend', 'broccoli:dev:serve')

  grunt.registerTask('test-frontend', [ 'jshint:frontend', 'jscs:frontend', 'build-frontend' ])
  grunt.registerTask('test-backend', [ 'jshint:backend', 'jscs:backend' ])
  grunt.registerTask('test', [ 'test-backend', 'test-frontend', 'jshint:grunt', 'jscs:grunt' ])
}
