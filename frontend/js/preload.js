$(function() {
  'use strict'

  let manifest = [
    { src: 'assets/images/box_tile.png',    id: 'box_tile' }
  , { src: 'assets/images/goodie_tile.png', id: 'goodie_tile' }
  ]

  window.loader = new createjs.LoadQueue()
  loader.loadManifest(manifest)
})
