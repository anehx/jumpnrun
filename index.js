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
var gameServer = require('./game.server.js')

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
    // set client id and score
    client.id = UUID()
    client.score = 0
    client.goodieTimer = undefined
    client.emit('connected', {id:client.id})
    console.log('\tsocket.io:: player ' + client.id + ' connected')

    var game = gameServer.findGame(client)

    client.emit('goodies', game.goodies)
    client.emit('boxes',   game.boxes)
    client.emit('state',   game.state)
    client.emit('color',   client.color)

    client.on('joined', function() {
        client.opponent = getOpponent(client)
        client.opponent.opponent = client

        console.log(client.opponent)
    })

    client.on('move', function(data) {
        client.opponent.emit('updatePos', data)
    })

    client.on('scored', function() {
        client.score++
        client.game.resetGoodies()

        client.opponent.emit('updateScore', {other_score: client.score,          self_score: client.opponent.score})
        client.emit         ('updateScore', {other_score: client.opponent.score, self_score: client.score         })
    })

    client.on('disconnect', function () {
        console.log('\tsocket.io:: client ' + client.id + ' disconnected')
        if (client.game.playerCount == 2) {
            client.opponent.emit('resetscore')
            client.opponent.emit('state', 'wait')
        }

        gameServer.quitGame(client)
    })
})
