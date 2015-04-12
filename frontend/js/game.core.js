class GameCore {
  constructor(options) {
    this.id            = options.id
    this.world         = {
      gravity: 0.3
    , x:       options.world.x
    , y:       options.world.y
    , boxes:   this.parseBoxes(options.world.boxes)
    , goodies: this.parseGoodies(options.world.goodies)
    }

    this.canvas        = document.createElement('canvas')
    this.canvas.id     = 'game'
    this.canvas.width  = this.world.x
    this.canvas.height = this.world.y
    this.stage         = new createjs.Stage(this.canvas)

    this.players       = {
      self:  new Player(this, false)
    , other: new Player(this, true)
    }
  }

  init() {
    document.body.appendChild(this.canvas)
    this.world.goodies.map(i => i.addToStage())
    this.world.boxes.map(i => i.addToStage())

    this.players.self.addToStage()
    this.players.other.addToStage()
  }

  parseGoodies(data) {
    return data.map(i => new Goodie(this, i))
  }

  parseBoxes(data) {
    return data.map(i => new Box(this, i))
  }

  colCheck(shapeA, shapeB) {
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

  drawPlayers(delta) {
    this.players.self.draw(delta)
    this.players.other.draw(delta)
  }
}

class Player {
  constructor(game, flipped) {
    this.game        = game
    this.velocity    = { x: 0,  y: 0 }
    this.size        = { x: 16, y: 32 }
    this.position    = { x: 0,  y: game.world.y - this.size.y }
    this.score       = 0
    this.color       = null
    this.name        = null
    this.scoreboard  = new ScoreBoard(this, flipped)

    this.speed       = 3
    this.jumpVelocity = 8
    this.stompVelocity = 15

    this.jumping     = false
    this.running     = false
    this.doubleJump  = false
    this.grounded    = true

    this.spritesheet = new createjs.SpriteSheet({
        images: [ 'assets/images/stickman.png' ]
      , frames: { width: 32, height: 32, count: 9, regX: 8, regY: 0 }
      , animations: {
          idle: 0
        , jump: 8
        , run:  [ 1, 8, 'run', 0.4 ]
      }
    })
    createjs.SpriteSheetUtils.addFlippedFrames(this.spritesheet, true, false, false)

    this.sprite      = new createjs.Sprite(this.spritesheet)
  }

  addToStage() {
    this.sprite.gotoAndPlay('idle')
    this.scoreboard.addToStage()
    this.game.stage.addChild(this.sprite)
  }

  jump() {
    if (!this.jumping && this.grounded) {
      this.jumping = true
      this.grounded = false
      this.velocity.y = -this.jumpVelocity
      this.sprite.gotoAndPlay('jump')
    }
    else if (!this.dblJump) {
      this.dblJump = true
      this.velocity.y = -this.jumpVelocity * 0.8
    }
  }

  stomp() {
    if (this.jumping && !this.grounded) {
      this.velocity.y = this.stompVelocity
      this.sprite.gotoAndPlay('stomp')
    }
  }

  runLeft() {
    this.velocity.x = -this.speed
    this.running    = true
  }

  runRight() {
    this.velocity.x = this.speed
    this.running    = true
  }

  run(keys) {
    this.velocity.x = 0
    this.running    = false
    if (keys[37]) {
      this.runLeft()
    }
    if (keys[39]) {
      this.runRight()
    }
  }

  move(delta) {
    delta /= 10

    this.velocity.y += this.game.world.gravity * delta
    this.position.y = this.position.y + this.velocity.y * delta
    this.position.x = this.position.x + this.velocity.x * delta
  }

  draw(delta) {
    this.move(delta)
    this.collide()
    this.enforceBoundingBox()
    this.collectGoodie()
    this.scoreboard.updateScore()

    this.sprite.x = this.position.x
    this.sprite.y = this.position.y
  }

  collide() {
    this.grounded = false
    for (let box of this.game.world.boxes) {
      let dir = this.game.colCheck(this, box)
      if (dir === 'l' || dir === 'r') {
        this.velocity.x = 0
        this.jumping = false
        this.dblJump = false
      } else if (dir === 'b') {
        this.grounded = true
        this.jumping = false
        this.dblJump = false
        if (!this.running) {
          this.sprite.gotoAndPlay('idle')
        }
      } else if (dir === 't') {
        this.velocity.y = this.game.world.gravity * 2
      }
    }
    if (this.grounded) {
      this.velocity.y = 0
    }
  }

  enforceBoundingBox() {
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
      if (!this.running) {
        this.sprite.gotoAndPlay('idle')
      }
    }
    else if (this.position.y < 0) {
      this.velocity.y = this.game.world.gravity * 2
    }
  }

  collectGoodie() {
    for (let i in this.game.world.goodies) {
      let goodie = this.game.world.goodies[i]
      if (this.game.colCheck(this, goodie)) {
        this.score++
        window.socket.emit('scored')
      }
    }
  }
}

class ScoreBoard extends createjs.Shape {
  constructor(player, flipped) {
    super()

    this.player    = player
    this.color     = '#000000'
    this.textColor = '#EEEEEE'
    this.alpha     = 0.7
    this.flipped   = flipped
    this.font      = '12px Monospace'
    this.name      = null
    this.score     = null
  }

  addToStage() {
    this.name  = new createjs.Text(this.player.name,              this.font, this.textColor)
    this.score = new createjs.Text(`Score: ${this.player.score}`, this.font, this.textColor)
    let i      = this.flipped ? this.player.game.world.x : 0
    let align  = this.flipped ? 'right' : 'left'

    this.graphics.beginFill(this.color)
    this.graphics.beginStroke(this.player.color)
    this.graphics.setStrokeStyle(3)
    this.graphics.moveTo(i,                  0)
    this.graphics.lineTo(i,                 50)
    this.graphics.lineTo(Math.abs(i - 150), 50)
    this.graphics.lineTo(Math.abs(i - 200),  0)
    this.graphics.lineTo(i,                  0)
    this.graphics.endStroke()
    this.graphics.endFill()

    this.name.fillStyle  = this.player.color
    this.name.textAlign  = align
    this.name.x          = Math.abs(i - 10)
    this.name.y          = 15

    this.score.fillStyle = this.player.color
    this.score.textAlign = align
    this.score.x         = Math.abs(i - 10)
    this.score.y         = 28

    this.player.game.stage.addChild(this, this.name, this.score)
  }

  updateScore() {
    this.score.text = `Score: ${this.player.score}`
  }
}

class Goodie extends createjs.Shape {
  constructor(game, data) {
    super()

    this.game     = game
    this.color    = '#FF0000'
    this.position = data.position
    this.size     = { x: 10, y: 10 }
    this.timeLeft = data.timeLeft
    this.text     = new createjs.Text(this.timeLeft / 1000, '10px Monospace', this.color)
    this.text.x   = this.position.x
    this.text.y   = this.position.y - 10
  }

  addToStage() {
    this.graphics.beginFill(this.color)
    this.graphics.drawRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.graphics.endFill()

    this.game.stage.addChild(this, this.text)
  }

  removeFromStage() {
    this.game.stage.removeChild(this, this.text)
  }
}

class Box extends createjs.Shape {
  constructor(game, data) {
    super()

    this.game     = game
    this.color    = '#000000'
    this.position = data.position
    this.size     = data.size
  }

  addToStage() {
    this.graphics.beginFill(this.color)
    this.graphics.drawRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.graphics.endFill()

    this.game.stage.addChild(this)
  }

  removeFromStage() {
    this.game.stage.removeChild(this)
  }
}
