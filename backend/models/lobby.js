'use strict'

let UUID = require('node-uuid')

let Lobby = module.exports = function() {
  this.id            = UUID()
  this.players       = {}

  this.world         = {
    x: 1000
  , y: 500
  }

  this.world.boxes   = this.generateBoxes(30)
  this.world.goodies = this.generateGoodies(1)
}

Lobby.prototype = {
  addClient: function(client) {
    client.gameID           = this.id
    client.score            = 0
    this.players[client.id] = client

    client.leave('lobby')
    client.join(this.id)

    console.log('\tlobby.js::\tclient ' + client.id + ' joined game ' + this.id)
  }

, removeClient: function(client) {
    client.gameID           = null
    this.players[client.id] = undefined

    client.leave(this.id)

    console.log('\tlobby.js::\tclient ' + client.id + ' left game ' + this.id)
  }

, generateBoxes: function(count) {
    let boxes = []
    for (let i = 0; i < count; i++) {
      boxes.push({
        position: {
          x: Math.floor(Math.random() * this.world.x)
        , y: Math.floor(Math.random() * 7 + 1) * this.world.y / 6
        }
      , size: {
          x: Math.floor(Math.random() * 150) + 40
        , y: 16
        }
      })
    }
    return boxes
  }

, score: function(client) {
    client.score++
    this.resetGoodies()

    let data = {
      score:   client.score
    , goodies: this.world.goodies
    }

    return data
  }

, resetGoodies: function() {
    this.world.goodies = this.generateGoodies(1)
  }

, generateGoodies: function(count) {
    let goodies = []
    for (let i = 0; i < count; i++) {
      goodies.push({
        position: {
          x: Math.floor(Math.random() * this.world.x)
        , y: Math.floor(Math.random() * 5 + 1) * this.world.y / 6 - 25
        }
      , timeLeft: 15 * 1000
      })
    }
    return goodies
  }
}
