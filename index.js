/*jshint strict:false */

var gameport  = 3000
var io        = require('socket.io')
var express   = require('express')
var UUID      = require('node-uuid')
var http      = require('http')
var app       = express()
var server    = http.createServer(app)

server.listen(gameport)
console.log('\texpress:: server listening on port ' + gameport + '\n')

app.get('/', function( req, res ){
    res.sendFile(__dirname + '/index.html');
})

app.use('/public', express.static(__dirname + '/public'))

/* Socket.IO server set up. */
var game_server = require('./game.server.js')

sio = io.listen(server)

function getOpponent(client) {
    var opponent
    if (client.game.player_count != 2) {
        opponent = null
    }

    if (client.game.player_host == client) {
        opponent = client.game.player_client
    }
    else {
        opponent = client.game.player_host
    }
    return opponent
}

sio.sockets.on('connection', function (client) {
    client.id = UUID()
    client.emit('clientconnected', { id: client.id } )
    console.log('\tsocket.io:: player ' + client.id + ' connected')

    var game = game_server.findGame(client)
    var opponent = null

    client.emit('getgoodie', game.goodie)
    client.emit('getboxes', game.boxes)

    if (client.game.player_count == 2) {

        client.emit('state', 'play')
        game.player_host.emit('state', 'play')
    }
    else {
        client.emit('state', 'wait')
    }

    client.on('sendPos', function(data) {
        opponent = getOpponent(client)
        if (opponent) {
            opponent.emit('updatePos', data)
        }
    })

    client.on('scored', function() {
        opponent = getOpponent(client)
        if (opponent) {
            opponent.emit('scored')
        }
    })

    client.on('disconnect', function () {
        console.log('\tsocket.io:: client ' + client.id + ' disconnected')
        if (client.game.player_count == 2) {
            if (client.game.player_host == client) {
                client.game.player_client.emit('state', 'wait')
            }
            else {
                client.game.player_host.emit('state', 'wait')
            }
        }
        game_server.quitGame(client)
    })
})
