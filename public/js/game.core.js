/* jshint browser:true */
'use strict'

function GameCore(options) {
  this.id            = options.id
  this.dt            = new Date().getTime()

  this.world         = {
    gravity: 0.3,
    x: options.world.x,
    y: options.world.y,
    boxes:   this.parseBoxes(options.world.boxes),
    goodies: this.parseGoodies(options.world.goodies)
  }

  this.canvas        = document.createElement('canvas')
  this.canvas.id     = 'game'
  this.canvas.width  = this.world.x
  this.canvas.height = this.world.y
  this.ctx           = this.canvas.getContext('2d')

  this.players       = {
    self:  new Player(this),
    other: new Player(this)
  }
}

GameCore.prototype = {
  init: function(world) {
    document.body.appendChild(this.canvas)
  },

  parseGoodies: function(data) {
    let goodies = []
    for (let i in data) {
      goodies.push(new Goodie(this, data[i]))
    }

    return goodies
  },

  parseBoxes: function(data) {
    let boxes = []
    for (let i in data) {
      boxes.push(new Box(this, data[i]))
    }

    return boxes
  },

  countdownGoodies: function(now) {
    for (let i in this.world.goodies) {
      let goodie = this.world.goodies[i]
      goodie.countdown(now)
    }
  },

  clearScreen: function() {
    this.ctx.clearRect(0, 0, this.world.x, this.world.y)
  },

  drawBoxes: function() {
    for (let i in this.world.boxes) {
      let box = this.world.boxes[i]
      box.draw()
    }
  },

  drawGoodies: function() {
    for (let i in this.world.goodies) {
      let goodie = this.world.goodies[i]
      goodie.draw()
    }
  },

  drawPlayers: function(now) {
    this.players.self.draw(now)
    this.players.other.draw(now)
  },

  draw: function(now) {
    this.clearScreen()
    this.drawBoxes()
    this.drawPlayers(now)
    this.drawGoodies()
    this.countdownGoodies(now)
  },

  colCheck: function(shapeA, shapeB) {
    // get the vectors to check against
    let vX = (shapeA.position.x + (shapeA.size.x / 2)) - (shapeB.position.x + (shapeB.size.x / 2))
    let vY = (shapeA.position.y + (shapeA.size.y / 2)) - (shapeB.position.y + (shapeB.size.y / 2))
    // add the half widths and half heights of the objects
    let hWidths  = (shapeA.size.x / 2) + (shapeB.size.x / 2)
    let hHeights = (shapeA.size.y / 2) + (shapeB.size.y / 2)
    let colDir = null

    // if the x and y vector are less than the half width or half height - collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      let oX = hWidths - Math.abs(vX)
      let oY = hHeights - Math.abs(vY)
      if (oX >= oY) {
        // figures out on which side we are colliding (top, bottom, left, or right)
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
}

function Player(game) {
  this.game        = game
  this.velocity    = { x: 0,  y: 0 }
  this.size        = { x: 26, y: 40 }
  this.position    = { x: 0,  y: game.world.y - this.size.y }
  this.score       = 0
  this.lastUpdate  = 0
  this.updateDelta = 0
  this.color       = '#00FF00'

  this.speed       = 3
  this.jump        = 8
  this.stomp       = 15

  this.jumping     = false
  this.walking     = false
  this.doubleJump  = false
  this.grounded    = true
  this.color       = null

  this.img         = new Image()
  this.img.src     = 'assets/images/mario.png'
  this.frame       = 0
  this.frameIndex  = 0
}

Player.prototype = {
  walk: function(keys) {
    this.velocity.x = 0
    this.walking = false
    if (keys[37]) {
      this.velocity.x = -this.speed
      this.walking = true
      this.frameIndex = 4
    }
    if (keys[39]) {
      this.velocity.x = this.speed
      this.walking = true
      this.frameIndex = 0
    }
  },

  move: function(now) {
    let delta = (this.game.dt - now) / 1000000000000

    this.velocity.y += this.game.world.gravity * delta
    this.position.y = this.position.y + this.velocity.y * delta
    this.position.x = this.position.x + this.velocity.x * delta
  },

  draw: function(now) {
    this.move(now)
    this.collide()
    this.enforceBoundingBox()

    // if (this.jumping) {
    //   this.frame = 3 + this.frameIndex
    // }
    // else if (this.walking) {
    //   let delta = Date.now() - this.lastUpdate
    //   if (this.updateDelta > 100) {
    //     this.updateDelta = 0
    //     if (this.frame - this.frameIndex < 2 && this.game.dt >= 3) {
    //       if (this.frameIndex === 4) {
    //         this.frame = 5
    //       }
    //       this.frame++
    //     }
    //     else {
    //       this.frame = this.frameIndex
    //     }
    //   }
    //   else {
    //     this.updateDelta += delta
    //   }
    // }
    // else if (this.grounded) {
    //   this.frame = this.frameIndex
    // }
    this.lastUpdate = Date.now()

    // this.game.ctx.drawImage(
    //   this.img,
    //   this.frame * this.size.x,
    //   0,
    //   this.size.x,
    //   this.size.y,
    //   this.position.x,
    //   this.position.y,
    //   this.size.x,
    //   this.size.y
    // )
    this.game.ctx.beginPath()
    this.game.ctx.fillStyle = this.color
    this.game.ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.game.ctx.closePath()
  },

  collide: function() {
    this.grounded = false
    for (let i in this.game.world.boxes) {
      let dir = this.game.colCheck(this, this.game.world.boxes[i])
      if (dir === 'l' || dir === 'r') {
        this.velocity.x = 0
        this.jumping = false
        this.dblJump = false
      } else if (dir === 'b') {
        this.grounded = true
        this.jumping = false
        this.dblJump = false
      } else if (dir === 't') {
        this.velocity.y = this.game.world.gravity * 2
      }
    }
    if (this.grounded) {
      this.velocity.y = 0
    }
  },

  enforceBoundingBox: function() {
    if (this.position.x + this.size.x > this.game.world.x) {
      this.position.x = this.game.world.x - this.size.x
    }
    else if (this.position.x < 0) {
      this.position.x = 0
    }
    if (this.position.y + this.size.y > this.game.world.y) {
      this.position.y = this.game.world.y - this.size.y
      this.velocity.y = 0
      this.jumping = false
      this.grounded = true
      this.dblJump = false
    }
    else if (this.position.y < 0) {
      this.velocity.y = this.game.world.gravity * 2
    }
  },

  collectGoodie: function() {
    for (let i in this.game.world.goodies) {
      let goodie = this.game.world.goodies[i]
      if (this.game.colCheck(this, goodie)) {
        this.score++
        window.socket.emit('scored')
      }
    }
  }
}

function Goodie(game, data) {
  this.game     = game
  this.color    = '#FF0000'
  this.position = data.position
  this.size     = { x: 10, y: 10 }
  this.timeLeft = 15 * 1000 // 15 sec
}

Goodie.prototype = {
  draw: function() {
    this.game.ctx.beginPath()
    this.game.ctx.fillStyle = this.color
    this.game.ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.game.ctx.font = '10px Monospace';
    this.game.ctx.textAlign = 'left';
    this.game.ctx.textBaseline = 'top';
    this.game.ctx.fillText(
        Math.floor(this.timeLeft / 1000),
        this.position.x + 10,
        this.position.y - 10
    )
    this.game.ctx.closePath()
  },

  countdown: function(now) {
    if (Math.floor(this.timeLeft / 1000 <= 0)) {
      window.socket.emit('resetGoodies')
    }
    this.timeLeft -= (this.game.dt - now) / 100000000000
  }
}

function Box(game, data) {
  this.game     = game
  this.color    = '#000000'
  this.position = data.position
  this.size     = data.size
}

Box.prototype = {
  draw: function() {
    this.game.ctx.beginPath()
    this.game.ctx.fillStyle = this.color
    this.game.ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.game.ctx.closePath()
  }
}
