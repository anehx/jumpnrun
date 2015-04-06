'use strict'

let UUID = require('node-uuid')

let Lobby = module.exports = function() {
  this.id          = UUID()
  this.players     = {}

  this.world       = {
    x: 1000,
    y: 500,
    boxes: [],
    goodies: []
  }
}

Lobby.prototype = {
  addClient: function(client) {
    this.players[client.id] = client
    client.join(this.id)
    console.log('\tlobby.js::\tclient ' + client.id + ' joined game ' + this.id)

    return this.id
  },

  removeClient: function(client) {
    client.leave(this.id)
    client.join('lobby')
    client.gameID = null
    delete this.players[client.id]
    console.log('\tlobby.js::\tclient ' + client.id + ' left game ' + this.id)
  },

  generateWorld: function() {
    this.generateBoxes(30)
    this.generateGoodies(1)
  },

  generateBoxes: function(count) {
    for (let i = 0; i < count; i++) {
      this.world.boxes.push({
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

  score: function(client) {
    client.score++

    let data = {
      'score':   client.score,
      'goodies': this.resetGoodies()
    }

    return data
  },

  resetGoodies: function() {
    this.world.goodies.length = 0
    this.generateGoodies(1)

    return this.world.goodies
  },

  generateGoodies: function(count) {
    for (let i = 0; i < count; i++) {
      this.world.goodies.push({
        position: {
          x: Math.floor(Math.random() * this.world.x),
          y: Math.floor(Math.random() * 5 + 1) * this.world.y / 6 - 25,
        }
      })
    }
  }
}
