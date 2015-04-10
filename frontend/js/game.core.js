class GameCore {
  constructor(options) {
    this.id            = options.id
    this.dt            = new Date().getTime()

    this.world         = {
      gravity: 0.3
    , x: options.world.x
    , y: options.world.y
    , boxes:   this.parseBoxes(options.world.boxes)
    , goodies: this.parseGoodies(options.world.goodies)
    }

    this.canvas        = document.createElement('canvas')

    this.canvas.id     = 'game'
    this.canvas.width  = this.world.x
    this.canvas.height = this.world.y
    this.stage         = new createjs.Stage(this.canvas)

    this.players       = {
      self:  new Player(this)
    , other: new Player(this)
    }

  }

  init() {
    document.body.appendChild(this.canvas)
    this.world.boxes.map(box => box.addToStage())
    this.world.goodies.map(goodie => goodie.addToStage())
  }

  parseGoodies(data) {
    return data.map(i => new Goodie(this, i))
  }

  parseBoxes(data) {
    return data.map(i => new Box(this, i))
  }

  drawBoxes() {
    for (let box of this.world.boxes) {
      box.addToStage()
    }
  }

  drawGoodies() {
    for (let goodie of this.world.goodies) {
      goodie.draw()
    }
  }

  drawPlayers() {
    this.players.self.draw()
    this.players.other.draw()
  }

  draw(now) {
    // this.stage.removeAllChildren()
    // this.drawBoxes()
    // this.drawPlayers()
    // this.drawGoodies()
    // this.drawScores()
    this.stage.update()
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

  drawScores() {
    this.players.self.drawScore(false)
    this.players.other.drawScore(true)
  }
}

class Player {
  constructor(game) {
    this.game        = game
    this.velocity    = { x: 0,  y: 0 }
    this.size        = { x: 26, y: 40 }
    this.position    = { x: 0,  y: game.world.y - this.size.y }
    this.score       = 0
    this.lastUpdate  = 0
    this.updateDelta = 0
    this.color       = null
    this.name        = null

    this.speed       = 3
    this.jumpVelocity  = 8
    this.stomp       = 15

    this.jumping     = false
    this.walking     = false
    this.doubleJump  = false
    this.grounded    = true

    this.spriteSheet = new createjs.SpriteSheet({
      framerate:  5
    , images:     [ 'assets/images/stickman.png' ]
    , frames:     { width: 32, height: 32, count: 8 }
    , animations: {
        stop:     0
      , run:      [ 1, 2, 3, 4, 5, 6, 7 , 8 ]
      }
    })
    this.animation   = new createjs.Sprite(this.spriteSheet, 'run')
  }

  jump() {
    if (!this.jumping && this.grounded) {
      this.jumping = true
      this.grounded = false
      this.velocity.y = -this.jumpVelocity
    }
    else if (!this.dblJump) {
      this.dblJump = true
      this.velocity.y = -this.jumpVelocity * 0.8
    }
  }

  stomp() {
    if (this.jumping && !this.grounded) {
      this.velocity.y = this.stomp
    }
  }

  walkLeft() {
    this.velocity.x = -this.speed
    this.walking = true
  }

  walkRight() {
    this.velocity.x = this.speed
    this.walking = true
  }

  walk(keys) {
    this.velocity.x = 0
    this.walking = false
    if (keys[37]) {
      this.walkLeft()
    }
    if (keys[39]) {
      this.walkRight()
    }
  }

  move(now) {
    let delta = (this.game.dt - now) / 1000000000000

    this.velocity.y += this.game.world.gravity * delta
    this.position.y = this.position.y + this.velocity.y * delta
    this.position.x = this.position.x + this.velocity.x * delta
  }

  draw(now) {
    // TODO: Sprites
    this.move(now)
    this.collide()
    this.enforceBoundingBox()
    this.lastUpdate = Date.now()

    // this.animation.x = this.position.x
    // this.animation.y = this.position.y
    this.game.stage.addChild(this.animation)
  }

  drawScore(flipped = false) {
    let box   = new createjs.Shape()
    let name  = new createjs.Text(this.name, '12px Monospace', this.color)
    let score = new createjs.Text(`Score: ${this.score}`, '12px Monospace', this.color)

    let i     = flipped ? this.game.world.x : 0
    let align = flipped ? 'right' : 'left'

    box.graphics.beginFill('#000000')
    box.graphics.beginStroke(this.color)
    box.graphics.moveTo(i,                  0)
    box.graphics.lineTo(i,                 50)
    box.graphics.lineTo(Math.abs(i - 150), 50)
    box.graphics.lineTo(Math.abs(i - 200),  0)
    box.graphics.lineTo(i,                  0)
    box.graphics.endStroke()
    box.graphics.endFill()

    box.alpha       = 0.7

    name.fillStyle  = this.color
    name.textAlign  = align
    name.x          = Math.abs(i - 10)
    name.y          = 15

    score.fillStyle = this.color
    score.textAlign = align
    score.x         = Math.abs(i - 10)
    score.y         = 28

    this.game.stage.addChild(box, name, score)
  }

  collide() {
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

    this.graphics.beginFill(this.color)
    this.graphics.drawRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.graphics.endFill()
  }

  removeFromStage() {
    this.game.stage.removeChild(this, this.text)
  }

  addToStage() {
    this.game.stage.addChild(this, this.text)
  }
}

class Box extends createjs.Shape {
  constructor(game, data) {
    super()

    this.game     = game
    this.color    = '#000000'
    this.position = data.position
    this.size     = data.size

    this.graphics.beginFill(this.color)
    this.graphics.drawRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.graphics.endFill()
  }

  removeFromStage() {
    this.game.stage.removeChild(this)
  }

  addToStage() {
    this.game.stage.addChild(this)
  }
}
