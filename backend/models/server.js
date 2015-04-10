'use strict'

let Lobby = require('./lobby.js')

let Server = module.exports = {
  games: {}

, createGame: function() {
    let game            = new Lobby()
    this.games[game.id] = game

    console.log('\tserver.js::\tcreated game ' + game.id)
    return game
  }

, quitGame: function(game) {
    for (let id in game.players) {
      game.removeClient(game.players[id])
    }
    this.games[game.id] = undefined
    console.log('\tserver.js::\tdeleted game ' + game.id)
  }
}
