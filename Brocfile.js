/* global require, module */

var esTranspiler = require('broccoli-babel-transpiler')
var funnel       = require('broccoli-funnel')
var mergeTrees   = require('broccoli-merge-trees')
var concat       = require('broccoli-concat')
var uglify       = require('broccoli-uglify-js')
var compileLess  = require('broccoli-less-single')
var cleanCss     = require('broccoli-clean-css')
var browserify   = require('broccoli-fast-browserify')

var appJsTree    = mergeTrees([ funnel('frontend/js'), funnel('backend/common') ])
var appLessTree  = funnel('frontend/less')
var vendorTree   = funnel('bower_components')

var appCss       = compileLess(appLessTree, 'app.less', 'app.css')
var vendorCss    = compileLess(vendorTree, 'bootstrap/less/bootstrap.less', 'vendor.css')

var vendorJs = concat(
  vendorTree, {
    inputFiles: [
      'EaselJS/lib/easeljs-0.8.0.combined.js'
    , 'SoundJS/lib/soundjs-0.6.0.combined.js'
    , 'PreloadJS/lib/preloadjs-0.6.0.combined.js'
    , 'jquery/dist/jquery.js'
    , 'socket.io-client/socket.io.js'
    , 'Keypress/keypress.js'
    ]
  , outputFile: '/vendor.js'
  }
)

var appJs = browserify(
  esTranspiler(appJsTree, {})
, {
    bundles: {
      'app.js': {
        entryPoints: [ 'app.js' ]
      }
    }
  , externals: [ 'jquery' ]
  }
)

if (process.env.NODE_ENV === 'production') {
  // uglify only in prod
  appJs     = uglify(appJs)
  vendorJs  = uglify(vendorJs)
  appCss    = cleanCss(appCss)
  vendorCss = cleanCss(vendorCss)
}

module.exports = mergeTrees([ appCss, appJs, vendorJs, vendorCss ])
