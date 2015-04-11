$(function() {
  'use strict'

  const [fps, server] = [ 60 , 'http://jumpnrun.vm:3000' ]

  window.socket = io.connect(server)

  let defaultName = 'Player-' + Math.round(Math.random() * 1000000)
  $('#name').val(defaultName).prop('placeholder', defaultName)
  $('#search').on('click', function() {
    let name = $('#name').val() || defaultName
    socket.emit('joinLobby', name)
    $('.lobby').hide()
    showSpinner('searching game')
  })

  function animate(now) {
    if (typeof gameCore !== 'undefined') {
      gameCore.players.self.walk(keys)
      gameCore.players.self.collectGoodie()
      gameCore.stage.update()
      requestNextAnimationFrame(animate)
    }
  }

  socket.on('joinedGame', function(data) {
    window.gameCore = new GameCore({
      world:   data.world
    , id:      data.id
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
    hideSpinner()
    gameCore.init()
    requestNextAnimationFrame(animate)
  })

  function sendPos() {
    if (typeof gameCore !== 'undefined') {
      socket.emit('sendPosition', {
        position: gameCore.players.self.position
      , walking: gameCore.players.self.walking
      , jumping: gameCore.players.self.jumping
      })
    }
  }

  function showSpinner(text) {
    $('.overlay').fadeIn()
    let i = 0
    setInterval(function() {
      i = ++i % 3
      $('.overlay div').html(text + '<br>' + '.'.repeat(i + 1))
    }, 500)
  }

  function hideSpinner() {
    $('.overlay').fadeOut()
  }

  $(document).keypress(function(e) {
    switch(e.keyCode) {
      case 38: // up arrow
        gameCore.players.self.jump()
        break

      case 40: // down arrow
        gameCore.players.self.stomp()
        break

      default: return
    }
    e.preventDefault()
  })

  socket.on('updatePosition', function(data) {
    gameCore.players.other.position = data.position
    gameCore.players.other.walking  = data.walking
    gameCore.players.other.jumping  = data.jumping
  })

  socket.on('updateScore', function(data) {
    gameCore.players.other.score = data
  })

  socket.on('updateGoodies', function(data) {
    gameCore.world.goodies.map(i => i.removeFromStage())
    gameCore.world.goodies = gameCore.parseGoodies(data)
    gameCore.world.goodies.map(i => i.addToStage())
  })

  socket.on('playerLeft', function() {
    $('#game').remove()
    gameCore = undefined
    socket.emit('joinLobby', name)
  })

  setInterval(sendPos, 1000 / fps)
});