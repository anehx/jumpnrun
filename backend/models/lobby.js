'use strict'

let UUID = require('node-uuid')

class Lobby {
  constructor() {
    this.id            = UUID()
    this.players       = {}

    this.world         = {
      x: 1024
    , y: 768
    , areas: 8
    }

    this.world.boxes   = this.generateBoxes()
    this.world.goodies = this.generateGoodies(1)
  }

  addClient(client) {
    client.gameID           = this.id
    client.score            = 0
    this.players[client.id] = client

    client.leave('lobby')
    client.join(this.id)

    console.log('\tlobby.js::\tclient ' + client.id + ' joined game ' + this.id)
  }

  removeClient(client) {
    client.gameID           = null
    this.players[client.id] = undefined

    client.leave(this.id)

    console.log('\tlobby.js::\tclient ' + client.id + ' left game ' + this.id)
  }

  generateBoxes() {
    const padding    = 50
    const minPerArea = 2
    const maxPerArea = 4
    const minWidth   = 60

    let boxes        = []

    for (let i = 1; i < this.world.areas; i++) {
      let posY     = this.world.y / this.world.areas * i
      let count    = Math.floor(Math.random() * maxPerArea) + minPerArea
      let maxWidth = Math.floor(this.world.x / count - padding)

      for (let j = 0; j < count; j++) {
        let width = Math.floor(Math.random() * maxWidth) + minWidth
        boxes.push({
          id: UUID()
        , size: {
            x: width
          , y: 12
          }
        , position: {
              x: this.world.x / count * j + Math.floor(Math.random() * (maxWidth - width)) + 2
            , y: posY
          }
        })
      }
    }

    return boxes
  }

  resetGoodies() {
    this.world.goodies = this.generateGoodies(1)
  }

  generateGoodies(count) {
    let goodies = []

    for (let i = 0; i < count; i++) {
      goodies.push({
        id: UUID()
      , size: {
          x: 12
        , y: 12
        }
      , position: {
          x: Math.floor(Math.random() * this.world.x)
        , y: this.world.y / this.world.areas * (Math.floor(Math.random() * (this.world.areas - 1)) + 1) - 25
        }
      , timeLeft: 15 * 1000
      })
    }
    return goodies
  }
}

module.exports = Lobby
