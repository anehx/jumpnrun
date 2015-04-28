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

  , nodemon: {
      dev: {
        script: 'backend/app'
      , options: {
          exec: './node_modules/.bin/babel-node'
        }
      }
    }

  , shell: {
      clean: {
        command: 'npm cache clean && rm -rf tmp/ etc/ node_modules/ bower_components/'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-broccoli')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('test-frontend', [ 'jshint:frontend', 'jscs:frontend', 'build' ])
  grunt.registerTask('test-backend',  [ 'jshint:backend', 'jscs:backend' ])
  grunt.registerTask('test',          [ 'test-backend', 'test-frontend', 'jshint:grunt', 'jscs:grunt' ])

  grunt.registerTask('build',         [ 'broccoli:prod:build' ])
  grunt.registerTask('clean',         [ 'shell:clean' ])

  grunt.registerTask('run-backend',   [ 'nodemon:dev' ])
  grunt.registerTask('run-frontend',  [ 'broccoli:dev:serve' ])
}
