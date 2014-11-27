/*jshint strict:false */

var UUID = require('node-uuid')

var gameServer = module.exports = {
    games: {},
    gameCount: 0
}

gameServer.createGame = function(client) {
    var game = new GameLobby(client)

    game.generateWorld()

    this.games[game.id] = game
    this.gameCount++

    client.game = game
    client.color = 'red'

    console.log('\t\tcreated game ' + game.id)
    return game
}

gameServer.findGame = function(client) {
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
}

gameServer.quitGame = function(client) {
    var gameInstance = this.games[client.game.id]

    if (gameInstance.playerCount < 2) {
        // client was alone so delete game
        console.log('\t\tdeleted game ' + gameInstance.id)
        delete this.games[client.game.id]
        this.gameCount--
        return
    }
    else if (gameInstance.player_host == client) {
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

function GameLobby(client) {
    this.id             = UUID()
    this.players        = {
        host:   client,
        client: null
    }
    this.playerCount    = 1
    this.state          = 'wait'

    // world definition
    this.world          = {
        x: 1000,
        y: 500
    }
    this.boxes          = []
    this.goodies        = []
}

GameLobby.prototype = {
    generateWorld: function() {
        this.generateBoxes(30)
        this.generateGoodies(1)
    },

    generateBoxes: function(count) {
        // generate [count] random boxes
        for (var i = 0; i < count; i++) {
            var randomBox = {
                position: {
                    x: Math.floor(Math.random() * this.world.x),
                    y: Math.floor(Math.random() * 7 + 1) * this.world.y / 6
                },
                size: {
                    x: Math.floor(Math.random() * 150) + 40,
                    y: 15
                }
            }
            this.boxes.push(randomBox)
        }
    },

    generateGoodies: function(count) {
        // generate [count] random goodies
        for (var i = 0; i < count; i++) {
            var randomGoodie = {
                x: Math.floor(Math.random() * this.world.x),
                y: Math.floor(Math.random() * 5 + 1) * this.world.y / 6 - 25
            }
            this.goodies.push(randomGoodie)
        }
    }
}
