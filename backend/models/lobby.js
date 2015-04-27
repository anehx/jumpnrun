'use strict'

import config  from '../common/config'
import physics from '../common/physics'
import UUID    from 'node-uuid'

export default class Lobby {
  constructor() {
    this.id            = UUID()
    this.players       = {}

    this.world         = {
      x:       config.world.x
    , y:       config.world.y
    , areas:   config.world.areas
    , boxes:   this.generateBoxes()
    , goodies: this.generateGoodies()
    }

    this.localTime             = 0
    this._deltaTime            = new Date().getTime()
    this._lastDeltaTime        = new Date().getTime()

    this._physicsDeltaTime     = new Date().getTime()
    this._lastPhysicsDeltaTime = new Date().getTime()

    this.startLobby()
    this.startPhysics()
  }

  startLobby() {
    setInterval(function() {
      this._deltaTime     = new Date().getTime() - this._lastDeltaTime
      this._lastDeltaTime = new Date().getTime()
      this.localTime     += this._deltaTime / 1000
    }, 4)
  }

  startPhysics() {
    setInterval(function() {
      this._physicsDeltaTime     = (new Date().getTime() - this._lastPhysicsDeltaTime) / 1000
      this._lastPhysicsDeltaTime = new Date().getTime()
      // this.updatePhysics()
    }, config.server.physicsRate)
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
    const padding    = config.boxes.padding
    const minPerArea = config.boxes.minPerArea
    const maxPerArea = config.boxes.maxPerArea
    const minWidth   = config.boxes.minWidth

    let boxes        = []

    for (let i = 1; i < config.world.areas; i++) {
      let posY     = config.world.y / config.world.areas * i
      let count    = Math.floor(Math.random() * maxPerArea) + minPerArea
      let maxWidth = Math.floor(config.world.x / count - padding)

      for (let j = 0; j < count; j++) {
        let width = Math.round((Math.random() * (maxWidth - minWidth) + minWidth) / 12 ) * 12
        boxes.push({
          id: UUID()
        , size: {
            x: width
          , y: 12
          }
        , position: {
              x: config.world.x / count * j + Math.floor(Math.random() * (maxWidth - width)) + 2
            , y: posY
          }
        })
      }
    }

    return boxes
  }

  resetGoodies() {
    this.world.goodies = this.generateGoodies()
  }

  generateGoodies() {
    let goodies = []

    for (let i = 0; i < config.goodies.count; i++) {
      goodies.push({
        id: UUID()
      , size: {
          x: 12
        , y: 12
        }
      , position: {
          x: Math.floor(Math.random() * config.world.x)
        , y: config.world.y / config.world.areas * (Math.floor(Math.random() * (config.world.areas - 1)) + 1) - 25
        }
      , timeLeft: 15 * 1000
      })
    }
    return goodies
  }
}
