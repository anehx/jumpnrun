'use strict'

let gameport  = 3000
let io        = require('socket.io')
let express   = require('express')
let http      = require('http')
let app       = express()
let server    = http.createServer(app)

server.listen(gameport)
console.log('\texpress::\tserver listening on port ' + gameport + '\n')

/* Socket.IO server set up. */
let gameServer = require('./lib/models/server.js')
let sio = io.listen(server)

sio.sockets.on('connection', function(client) {
  client.gameID = null
  client.emit('connected', { id:client.id })
  console.log('\tsocket.io::\tclient ' + client.id + ' connected')

  // join the lobby
  client.join('lobby')

  let idleClients = sio.sockets.adapter.rooms.lobby
  if (Object.keys(idleClients).length === 2) {
    let game = gameServer.createGame()

    for (let clientID in idleClients) {
      let c = sio.sockets.connected[clientID]
      c.leave('lobby')
      c.gameID = game.addClient(c)
      c.score = 0
    }

    sio.sockets.in(game.id).emit('joinedGame', {
      'world': game.world,
      'id':    game.id
    })
  }

  client.on('sendPosition', function(data) {
    client.broadcast.to(client.gameID).emit('updatePosition', data)
  })

  client.on('scored', function() {
    let game = gameServer.games[client.gameID]
    let data = game.score(client)
    client.broadcast.to(client.gameID).emit('updateScore', data.score)
    sio.sockets.in(client.gameID).emit('updateGoodies', data.goodies)
  })

  client.on('resetGoodies', function() {
    let game = gameServer.games[client.gameID]
    let data = game.resetGoodies()
    sio.sockets.in(client.gameID).emit('updateGoodies', data)
  })

  client.on('disconnect', function() {
    if (client.gameID) {
      let game = gameServer.games[client.gameID]
      sio.sockets.in(client.gameID).emit('playerLeft')
      gameServer.quitGame(game)
    }
    console.log('\tsocket.io::\tclient ' + client.id + ' disconnected')
  })
})
