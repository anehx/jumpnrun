'use strict'

let gameport  = parseInt(process.env.SERVER_PORT, 10) || 3000
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
  client.on('joinLobby', function(name) {
    client.name = name
    client.join('lobby')
  })

  function checkForLobbies() {
    let idleClients = sio.sockets.adapter.rooms.lobby

    if (typeof idleClients !== 'undefined' && Object.keys(idleClients).length === 2) {
      let game = gameServer.createGame()
      let players = []
      let colors = ['#FF0000', '#0000FF']
      let i = 0

      for (let clientID in idleClients) {
        let c = sio.sockets.connected[clientID]
        game.addClient(c)

        players.push({
          id: c.id,
          name: c.name,
          color: colors[i]
        })
        i++
      }

      sio.sockets.in(game.id).emit('joinedGame', {
        world:   game.world,
        id:      game.id,
        players: players
      })

      setInterval(function() {
        for (let i in game.world.goodies) {
          let goodie = game.world.goodies[i]
          if (goodie.timeLeft === 0) {
            game.resetGoodies()
          }
          else {
            goodie.timeLeft -= 1000
          }
          sio.sockets.in(game.id).emit('updateGoodies', game.world.goodies)
        }
      }, 1000)
    }
  }

  setInterval(checkForLobbies, 5 * 1000) // check for lobbies all 5 seconds

  client.on('sendPosition', function(data) {
    client.broadcast.to(client.gameID).emit('updatePosition', data)
  })

  client.on('scored', function() {
    let game = gameServer.games[client.gameID]
    let data = game.score(client)
    client.broadcast.to(client.gameID).emit('updateScore', data.score)
    sio.sockets.in(client.gameID).emit('updateGoodies', data.goodies)
  })

  client.on('disconnect', function() {
    if (client.gameID) {
      let game = gameServer.games[client.gameID]
      client.broadcast.to(client.gameID).emit('playerLeft')
      gameServer.quitGame(game)
    }
    console.log('\tsocket.io::\tclient ' + client.id + ' disconnected')
  })
})
