import GameCore from './models/game.core'
import { keys, initKeypress } from './input'
import config from './config'
import socket from './socket'

$(function() {
  'use strict'

  let defaultName = 'Player-' + Math.round(Math.random() * 1000000)
  $('#name').val(defaultName).prop('placeholder', defaultName)
  $('#search').on('click', start)
  $('#name').keyup(function(e) {
    if (e.which === 13) {
      start()
    }
  })

  function start() {
    window.name = $('#name').val() || defaultName
    socket.emit('joinLobby', name)
    $('.lobby').hide()
    showSpinner('Waiting for opponent')
  }

  createjs.Ticker.addEventListener('tick', tick)
  createjs.Ticker.useRAF = true
  createjs.Ticker.setFPS(config.client.fps)

  function tick(e) {
    if (typeof gameCore !== 'undefined') {
      gameCore.drawPlayers()
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
    $(window).resize(fullscreen)
    fullscreen()
  })

  function sendPos() {
    if (typeof gameCore !== 'undefined') {
      socket.emit('sendPosition', {
        position: gameCore.players.self.position
      , velocity: gameCore.players.self.velocity
      , state:    gameCore.players.self.state
      })
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
    gameCore.players.other.position = data.position
    gameCore.players.other.velocity = data.velocity
    gameCore.players.other.state    = data.state
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

  function fullscreen() {
    let ratio = config.world.x / config.world.y
    let newRt = window.innerWidth / window.innerHeight

    if (newRt >= ratio) {
      $('#game').css({ height: '100%', width: 'auto' })
    }
    else {
      $('#game').css({ height: 'auto', width: '100%' })
    }
  }

  setInterval(sendPos, 1000 / config.client.fps)
});
