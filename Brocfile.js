var esTranspiler = require('broccoli-babel-transpiler')
var funnel       = require('broccoli-funnel')
var mergeTrees   = require('broccoli-merge-trees')
var concat       = require('broccoli-concat')
var uglify       = require('broccoli-uglify-js')

var app = funnel('frontend/js')

var bower = concat('bower_components', {
  inputFiles: [
    'EaselJS/lib/easeljs-0.8.0.combined.js',
    'SoundJS/lib/soundjs-0.6.0.combined.js',
    'jquery/dist/jquery.js',
    'socket.io-client/socket.io.js',
  ],
  outputFile: '/vendor.js'
})

bower = uglify(bower, { mangle: true, compress: true })
var scriptTree = esTranspiler(app, {})

module.exports = mergeTrees([ scriptTree, bower ])
