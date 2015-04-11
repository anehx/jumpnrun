/* global require, module */

var esTranspiler = require('broccoli-babel-transpiler')
var funnel       = require('broccoli-funnel')
var mergeTrees   = require('broccoli-merge-trees')
var concat       = require('broccoli-concat')
var uglify       = require('broccoli-uglify-js')
var compileLess  = require('broccoli-less-single')
var cleanCss     = require('broccoli-clean-css')

var appJsTree    = funnel('js')
var appLessTree  = funnel('less')
var vendorTree   = funnel('bower_components')

var appCss       = cleanCss(compileLess(appLessTree, 'app.less', 'app.css'))
var vendorCss    = cleanCss(compileLess(vendorTree, 'bootstrap/less/bootstrap.less', 'vendor.css'))

var vendorJs = uglify(
  concat(
    vendorTree, {
      inputFiles: [
        'EaselJS/lib/easeljs-0.8.0.combined.js'
      , 'SoundJS/lib/soundjs-0.6.0.combined.js'
      , 'jquery/dist/jquery.js'
      , 'socket.io-client/socket.io.js'
      , 'Keypress/keypress.js'
      ]
    , outputFile: '/vendor.js'
    }
  )
, {
    mangle: true
  , compress: true
  }
)

var appJs = uglify(
  concat(
    esTranspiler(appJsTree, {})
  , {
      inputFiles: [ '*.js' ]
    , outputFile: '/app.js' }
  )
)

module.exports = mergeTrees([ appCss, appJs, vendorJs, vendorCss ])