'use strict'

import Lobby from './lobby'

let Server = {
  games: {}

, createGame() {
    let game            = new Lobby()
    this.games[game.id] = game

    console.log('\tserver.js::\tcreated game ' + game.id)
    return game
  }

, quitGame(game) {
    for (let id in game.players) {
      game.removeClient(game.players[id])
    }
    this.games[game.id] = undefined
    console.log('\tserver.js::\tdeleted game ' + game.id)
  }
}

export default Server
