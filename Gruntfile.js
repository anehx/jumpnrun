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
          exec: 'npm run babel-node'
        }
      }
    }

  , concurrent: {
      run: {
        tasks: [ 'nodemon:dev', 'broccoli:dev:serve' ]
      , options: {
          logConcurrentOutput: true
        }
      }
    }

  , shell: {
      run: {
        command: 'vagrant ssh -c "cd /vagrant && grunt concurrent:run"'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-broccoli')
  grunt.loadNpmTasks('grunt-concurrent')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('test-frontend', [ 'jshint:frontend', 'jscs:frontend', 'build' ])
  grunt.registerTask('test-backend',  [ 'jshint:backend', 'jscs:backend' ])
  grunt.registerTask('test',          [ 'test-backend', 'test-frontend', 'jshint:grunt', 'jscs:grunt' ])

  grunt.registerTask('build',         [ 'broccoli:prod:build' ])
  grunt.registerTask('run',           [ 'shell:run' ])

  grunt.registerTask('default',       [ 'run' ])
}
