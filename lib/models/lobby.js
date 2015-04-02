'use strict'

var UUID = require('node-uuid')

var Lobby = module.exports = function() {
  this.id          = UUID()
  this.players     = {
    host   : null,
    client : null
  }
  this.playerCount = 1
  this.state       = 'wait'
  this.goodieTimer = undefined

  this.goodieTime  = 17000

  this.world       = {
    x : 1000,
    y : 500
  }
  this.boxes       = []
  this.goodies     = []
}

Lobby.prototype = {
  setHost: function(host){
    this.players.host = host
  },

  generateWorld: function() {
    this.generateBoxes(30)
    this.resetGoodies()
  },

  emit: function(name, data) {
    for (var p in this.players) {
      if (this.players[p]) {
        this.players[p].emit(name,data)
      }
    }
  },

  resetGoodies: function() {
    clearTimeout(this.goodieTimer)
    this.goodies.length = 0
    this.generateGoodies(1)
    this.emit('goodies', this.goodies)
    this.goodieTimer = setTimeout(this.resetGoodies.bind(this), this.goodieTime)
  },

  generateBoxes: function(count) {
    // generate [count] random boxes
    for (var i = 0; i < count; i++) {
      this.boxes.push({
        position: {
          x: Math.floor(Math.random() * this.world.x),
          y: Math.floor(Math.random() * 7 + 1) * this.world.y / 6
        },
        size: {
          x: Math.floor(Math.random() * 150) + 40,
          y: 16
        }
      })
    }
  },

  generateGoodies: function(count) {
    // generate [count] random goodies
    for (var i = 0; i < count; i++) {
      this.goodies.push({
        x: Math.floor(Math.random() * this.world.x),
        y: Math.floor(Math.random() * 5 + 1) * this.world.y / 6 - 25,
        timeLeft: this.goodieTime
      })
    }
  }
}
