import GameCore from './models/game.core'
import { keys, initKeypress } from './input'
import config from './config'

$(function() {
  'use strict'

  window.socket = io.connect(`${config.server.url}:${config.server.port}`)

  let defaultName = 'Player-' + Math.round(Math.random() * 1000000)
  $('#name').val(defaultName).prop('placeholder', defaultName)
  $('#search').on('click', function() {
    window.name = $('#name').val() || defaultName
    socket.emit('joinLobby', name)
    $('.lobby').hide()
    showSpinner('Waiting for opponent')
  })

  createjs.Ticker.addEventListener('tick', animate)
  createjs.Ticker.useRAF = true
  createjs.Ticker.setFPS(config.client.fps)

  function animate(e) {
    if (typeof gameCore !== 'undefined') {
      gameCore.players.self.sprite.x = gameCore.players.self.position.x
      gameCore.players.self.sprite.y = gameCore.players.self.position.y
      gameCore.stage.update(e)
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
        gameCore.players.self.name  = player.name
        gameCore.players.self.color = player.color
      }
      else {
        gameCore.players.other.name  = player.name
        gameCore.players.other.color = player.color
      }
    }
    hideSpinner()
    gameCore.init()
    initKeypress()
  })

  function sendPos() {
    if (typeof gameCore !== 'undefined') {
      socket.emit('sendPosition', gameCore.players.self.position)
    }
  }

  function showSpinner(text) {
    $('.overlay').fadeIn()
    let i = 0
    setInterval(function() {
      i = ++i % 3
      $('.overlay div').html(text + '<br>' + '.'.repeat(i + 1))
    }, 1000)
  }

  function hideSpinner() {
    $('.overlay').fadeOut()
  }

  socket.on('updatePosition', function(data) {
    gameCore.players.other.position.x = data.x
    gameCore.players.other.position.y = data.y
  })

  socket.on('updateScore', function(data) {
    gameCore.players.other.score = data
    gameCore.players.other.scoreBoardContainer.updateScore()
  })

  socket.on('updateGoodies', function(data) {
    gameCore.goodieContainer.updateGoodies(data)
  })

  socket.on('updateGoodieTime', function(data) {
    gameCore.goodieContainer.updateGoodieTime(data.id, data.timeLeft)
  })

  socket.on('playerLeft', function() {
    $('#game').remove()
    gameCore = undefined
    socket.emit('joinLobby', name)
    showSpinner('Waiting for opponent')
  })

  // setInterval(sendPos, 1000)
});
