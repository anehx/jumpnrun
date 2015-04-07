$(function() {
  'use strict'

  if (!createjs.Sound.initializeDefaultPlugins()) {
    return
  }

  let mute   = true
  let path   = 'assets/sounds/'
  let sounds = [
    { id: 'background', src: 'background.ogg' },
  ]

  createjs.Sound.alternateExtensions = [ 'mp3' ]
  createjs.Sound.on('fileload', function() {
    createjs.Sound.play('background', { loop:-1 })
  })
  createjs.Sound.registerSounds(sounds, path)

  $('.sound').toggleClass('mute', mute)
  createjs.Sound.setMute(mute)

  $('.sound').on('click', function() {
    mute = !mute
    $(this).toggleClass('mute', mute)
    createjs.Sound.setMute(mute)
  })
});
