$(function() {
  "use strict";
  if (!createjs.Sound.initializeDefaultPlugins()) return

  var mute   = false;
  var path   = 'assets/sounds/'
  var sounds = [
    {id:'background', src:'background.ogg'},
  ]

  createjs.Sound.alternateExtensions = ['mp3']
  createjs.Sound.on('fileload', function(){createjs.Sound.play('background', {loop:-1})})
  createjs.Sound.registerSounds(sounds, path)

  $('.sound').on('click', function(){
    mute = !mute
    $(this).toggleClass('mute', mute)
    createjs.Sound.setMute(mute)
  })
});
