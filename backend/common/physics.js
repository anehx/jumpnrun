'use strict'

import config from './config'

let physics = {
  enforceBoundingBox(player) {
    if (player.position.x + player.size.x > config.world.x) {
      // right collision
      player.position.x = 0
    }
    else if (player.position.x < 0) {
      // left collision
      player.position.x = config.world.x - player.size.x
    }
    if (player.position.y + player.size.y > config.world.y) {
      // bottom collision
      player.position.y = config.world.y - player.size.y
      player.velocity.y = 0
      player.state.jump = 0
      player.state.grounded = true
    }
    else if (player.position.y < 0) {
      // top collision
      player.position.y = 0
      player.velocity.y = -player.velocity.y * config.physics.bounce
    }
  }

, colCheck(shapeA, shapeB) {
    // get the vectors to check against
    let vX = (shapeA.position.x + shapeA.size.x / 2) - (shapeB.position.x + shapeB.size.x / 2)
    let vY = (shapeA.position.y + shapeA.size.y / 2) - (shapeB.position.y + shapeB.size.y / 2)
    // add the half widths and half heights of the objects
    let hWidths  = shapeA.size.x / 2 + shapeB.size.x / 2
    let hHeights = shapeA.size.y / 2 + shapeB.size.y / 2
    let colDir = null

    // if the x and y vector are less than the half width or half height - collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      let oX = hWidths - Math.abs(vX)
      let oY = hHeights - Math.abs(vY)
      if (oX >= oY) {
        if (vY > 0) {
          colDir = 't'
          shapeA.position.y += oY
        }
        else {
          colDir = 'b'
          shapeA.position.y -= oY
        }
      }
      else {
        if (vX > 0) {
          colDir = 'l'
          shapeA.position.x += oX
        }
        else {
          colDir = 'r'
          shapeA.position.x -= oX
        }
      }
    }
    return colDir
  }

, collide(player) {
    player.state.grounded = false
    for (let id in player.game.boxes) {
      let box = player.game.boxes[id]
      let dir = this.colCheck(player, box)
      if (dir === 'l' || dir === 'r') {
        player.velocity.x = -player.velocity.x * config.physics.bounce
      }
      else if (dir === 'b') {
        player.state.grounded = true
        player.state.jump = 0
      }
      else if (dir === 't') {
        player.velocity.y = 0
      }
    }
    if (player.state.grounded) {
      player.velocity.y = 0
    }
  }

, collectGoodie(player) {
    for (let id in player.game.goodies) {
      let goodie = player.game.goodies[id]
      if (this.colCheck(player, goodie)) {
        player.collectGoodie(goodie.id)
      }
    }
  }

, jump(player) {
    if (player.state.jump < 2) {
      player.state.jump++

      let multiplier = Math.pow(config.player.jumpDecay, player.state.jump)

      player.state.grounded = false
      player.velocity.y     = -config.player.jumpSpeed * multiplier
    }
  }

, stomp(player) {
    if (player.state.jump > 0 && !player.state.grounded) {
      player.velocity.y = config.player.stompSpeed
    }
  }

, runLeft(player) {
    player.velocity.x    = -config.player.runSpeed
    player.state.running = true
  }

, runRight(player) {
    player.velocity.x    = config.player.runSpeed
    player.state.running = true
  }

, handleInput(player) {
    player.velocity.x = 0
    player.state.running = false
    if (player.keys[37] && !player.keys[39]) {
      this.runLeft(player)
    }
    if (player.keys[39] && !player.keys[37]) {
      this.runRight(player)
    }
    if (player.keys[38] && !player.keys[40]) {
      this.jump(player)
      player.keys[38] = undefined
    }
    if (player.keys[40] && !player.keys[38]) {
      this.stomp(player)
      player.keys[40] = undefined
    }
  }

, changePosition(player, delta) {
    player.velocity.y += Math.round(config.physics.gravity * delta * 10)
    player.position.y  = Math.round(player.position.y + player.velocity.y * delta * 10)
    player.position.x  = Math.round(player.position.x + player.velocity.x * delta * 10)
  }
}

export default physics
