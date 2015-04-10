$(function() {
  'use strict'
  window.keys   = []

  document.body.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
  })
  document.body.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
  })

})
