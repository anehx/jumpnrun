$(function() {
  'use strict'

  const OPTIONS = {
    'FPS':    60,
    'SERVER': 'http://jumpnrun.vm:3000'
  }

  window.socket = io.connect(OPTIONS.SERVER)

  function animate(now) {
    if (typeof gameCore !== 'undefined') {
      gameCore.players.self.walk(keys)
      gameCore.players.self.collectGoodie()
      gameCore.draw(now)
      requestNextAnimationFrame(animate)
    }
  }

  socket.on('joinedGame', function(data) {
    window.gameCore = new GameCore({ 'world': data.world, id: data.id })
    gameCore.init()
    requestNextAnimationFrame(animate)
  })

  function sendPos() {
    if (typeof gameCore !== 'undefined') {
      socket.emit('sendPosition', {
        position: gameCore.players.self.position,
        walking: gameCore.players.self.walking,
        jumping: gameCore.players.self.jumping,
        frameIndex: gameCore.players.self.frameIndex
      })
    }
  }

  socket.on('updatePosition', function(data) {
    gameCore.players.other.position = data.position
    gameCore.players.other.walking = data.walking
    gameCore.players.other.jumping = data.jumping
    gameCore.players.other.frameIndex = data.frameIndex
  })

  socket.on('updateScore', function(data) {
    gameCore.players.other.score = data.score
  })

  socket.on('updateGoodies', function(data) {
    gameCore.world.goodies = gameCore.parseGoodies(data)
  })

  socket.on('playerLeft', function() {
    $('#game').remove()
    gameCore = undefined
  })

  setInterval(sendPos, 1000 / OPTIONS.FPS)
});
