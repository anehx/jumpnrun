'use strict'

import Lobby from './lobby'

let Server = {
  games:          {}
, localTime:      0
, _deltaTime:     new Date().getTime()
, _lastDeltaTime: new Date().getTime()

, startServer() {
    setInterval(function() {
      this._deltaTime     = new Date().getTime() - this._lastDeltaTime
      this._lastDeltaTime = new Date().getTime()
      this.localTime     += this._deltaTime / 1000
    }, 4)
  }

, createGame() {
    let game            = new Lobby()
    this.games[game.id] = game

    console.log('\tserver.js::\tcreated game ' + game.id)
    return game
  }

, quitGame(game) {
    for (let id in game.players) {
      let player = game.players[id]
      game.removeClient(player)
    }
    this.games[game.id] = undefined
    console.log('\tserver.js::\tdeleted game ' + game.id)
  }
}

export default Server
