'use strict'

var GameLobby = require('./game.lobby.js')

var gameServer = module.exports = {
    games: {},
    gameCount: 0
}

gameServer.prototype = {
  createGame: function(client) {
    var game = new GameLobby(client)

    game.generateWorld()

    this.games[game.id] = game
    this.gameCount++

    client.game = game
    client.color = 'red'

    console.log('\t\tcreated game ' + game.id)
    return game
  },

  findGame: function(client) {
    var game = null

    if (this.gameCount) {
      var joined = false

      for (var id in this.games) {
        var gameInstance = this.games[id]

        if (gameInstance.playerCount < 2) {
          // join the game
          client.game                        = gameInstance
          client.color                       = 'green'
          game                               = gameInstance
          joined                             = true
          gameInstance.players.client        = client
          gameInstance.state                 = 'play'
          gameInstance.playerCount++
          gameInstance.players.host.emit('joined')
          client.emit('type', 'luigi')
          client.opponent = gameInstance.players.host
          gameInstance.players.host.opponent = client

          console.log('\t\tjoined game ' + id)
        }
      }
      if(!joined) {
        game = this.createGame(client)
      }
    } else {
      game = this.createGame(client)
    }
    return game
  },

  quitGame: function(client) {
    var gameInstance = this.games[client.game.id]

    if (gameInstance.playerCount < 2) {
      // client was alone so delete game
      console.log('\t\tdeleted game ' + gameInstance.id)
      delete this.games[client.game.id]
      this.gameCount--
      return
    }
    else if (gameInstance.players.host == client) {
      // client was host so make the client host
      // and leave
      gameInstance.players.host   = gameInstance.players.client
      gameInstance.players.host.color = client.color
      gameInstance.players.client = null
      gameInstance.playerCount--
    }
    else {
      // client was client so just leave
      gameInstance.players.client = null
      gameInstance.playerCount--
    }

    console.log('\t\tleft game ' + gameInstance.id)
  }
}
