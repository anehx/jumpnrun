$(function() {
  'use strict'

  const OPTIONS = {
    'FPS':    60,
    'SERVER': 'http://jumpnrun.vm:3000'
  }

  window.socket = io.connect(OPTIONS.SERVER)

  let defaultName = 'Player-' + Math.round(Math.random() * 1000000)
  let name = prompt('Please enter your nickname', defaultName)
  if (name === null) {
    name = defaultName
  }
  socket.emit('joinLobby', name)

  function animate(now) {
    if (typeof gameCore !== 'undefined') {
      gameCore.players.self.walk(keys)
      gameCore.players.self.collectGoodie()
      gameCore.draw(now)
      requestNextAnimationFrame(animate)
    }
  }

  socket.on('joinedGame', function(data) {
    window.gameCore = new GameCore({
      world:   data.world,
      id:      data.id
    })
    for (let i in data.players) {
      let player = data.players[i]

      if (player.id === socket.id) {
        gameCore.players.self.name = player.name
        gameCore.players.self.color = player.color
      }
      else {
        gameCore.players.other.name = player.name
        gameCore.players.other.color = player.color
      }
    }

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
    gameCore.players.other.score = data
  })

  socket.on('updateGoodies', function(data) {
    gameCore.world.goodies = gameCore.parseGoodies(data)
  })

  socket.on('playerLeft', function() {
    $('#game').remove()
    gameCore = undefined
    console.log(socket.name)
    socket.emit('joinLobby', name)
  })

  setInterval(sendPos, 1000 / OPTIONS.FPS)
});
