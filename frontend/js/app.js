import GameCore from './models/game.core'
import { keys, initKeypress } from './input'
import config from './config'
import socket from './socket'

$(function() {
  'use strict'

  if (localStorage.getItem('playerName')) {
    start()
  }

  let defaultName = 'Player-' + Math.round(Math.random() * 1000000)
  $('#name').val(defaultName).prop('placeholder', defaultName)
  $('#search').on('click', start)
  $('#name').keyup(function(e) {
    if (e.which === 13) {
      localStorage.setItem('playerName', $('#name').val())
      start()
    }
  })

  function start() {
    window.name = localStorage.getItem('playerName') || $('#name').val() || defaultName
    socket.emit('joinLobby', name)
    $('.lobby').hide()
    showSpinner('Waiting for opponent', true)
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

  function showSpinner(text, points) {
    $('.overlay div').html('')
    $('.overlay').fadeIn()
    let style = points ? '' : 'style="display:none"'

    let i = 0
    window.interval = setInterval(function() {
      i = ++i % 3
      let pts = '.'.repeat(i + 1)
      $('.overlay div').html(`${text}<br><span ${style}>${pts}</span>`)
    }, 1000)
  }

  function hideSpinner() {
    window.clearInterval(window.interval)
    $('.overlay').fadeOut()
    $('.overlay div').html('')
  }

  socket.on('won', function() {
    $('#game').remove()
    gameCore = undefined
    showSpinner('You won!', false)
    setTimeout(function() {
      hideSpinner()
      start()
    }, 5000)
  })

  socket.on('lost', function() {
    $('#game').remove()
    gameCore = undefined
    showSpinner('You lost!', false)
    setTimeout(function() {
      hideSpinner()
      start()
    }, 5000)
  })

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

  $('.menu-button#exit').on('click', function() {
    socket.emit('exitGame')
  })

  $('.menu-button#cancel').on('click', function() {
    $('.menu').animate({ height: 0, padding: 0, opacity: 0 })
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
