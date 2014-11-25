/*jshint strict:false */

var UUID = require('node-uuid')

var game_server = module.exports = {
    games: {},
    game_count: 0
}

game_server.createGame = function(client) {
    var game = {
        id:            UUID(),
        player_host:   client,
        player_client: null,
        player_count:  1,
        boxes: [],
        goodie: null
    }

    game.goodie = {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 5 + 1) * 500 / 6 - 25
    }

    // generate boxes
    for (var i = 0; i < 30; i++) {
        game.boxes.push({
            position: {
                x: Math.floor(Math.random() * 1000),
                y: Math.floor(Math.random() * 7 + 1) * 500 / 6
            },
            size: {
                x: Math.floor(Math.random() * 150) + 40,
                y: 12
            }
        })
    }

    this.games[game.id] = game
    this.game_count++

    client.game = game

    console.log('\t\tcreated game ' + game.id)
    return game
}

game_server.findGame = function(client) {
    var game = null
    if (this.game_count) {
        var joined_a_game = false
        for (var gameID in this.games) {
            var game_instance = this.games[gameID]
            if(game_instance.player_count < 2) {
                game_instance.player_client = client
                game_instance.player_count++
                joined_a_game = true
                client.game = game_instance
                game = game_instance
                console.log('\t\tjoined game ' + gameID)
            }
        }
        if(!joined_a_game) {
            game = this.createGame(client)
        }
    } else {
        game = this.createGame(client)
    }
    return game
}

game_server.quitGame = function(client) {
    var game_instance = this.games[client.game.id]

    if (game_instance.player_count < 2) {
        delete this.games[client.game.id]
        this.game_count--
    }
    else if (game_instance.player_host == client) {
        game_instance.player_host = game_instance.player_client
        game_instance.player_client = null
        game_instance.player_count--
    }
    else {
        game_instance.player_client = null
        game_instance.player_count--
    }

    console.log('\t\tleft game ' + game_instance.id)
}
