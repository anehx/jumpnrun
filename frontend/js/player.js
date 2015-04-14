class Player {
  constructor(game) {
    this.game        = game
    this.velocity    = { x: 0,  y: 0 }
    this.size        = { x: 19, y: 32 }
    this.position    = { x: 0,  y: game.world.y - this.size.y }
    this.score       = 0
    this.color       = null
    this.name        = null

    this.speed       = 3
    this.jumpVelocity = 8
    this.stompVelocity = 15

    this.jumping     = false
    this.running     = false
    this.doubleJump  = false
    this.grounded    = true

    this.spritesheet = new createjs.SpriteSheet({
        images: [ 'assets/images/stickman.png' ]
      , frames: { width: 19, height: 32, count: 9 }
      , animations: {
          idle: 0
        , jump: 8
        , run:  [ 1, 8, 'run', 0.4 ]
      }
    })
    this.sprite      = new createjs.Sprite(this.spritesheet)
  }

  addToStage(flipped) {
    this.sprite.gotoAndPlay('idle')
    this.sprite.shadow = new createjs.Shadow(this.color, 0, 0, 2)
    this.scoreBoardContainer = new ScoreBoardContainer(this, flipped)
    this.scoreBoardContainer.addToStage()
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
    if (this.sprite.currentAnimation !== 'run' || this.sprite.scaleX !== -1) {
      this.sprite.scaleX = -1
      this.sprite.regX   = this.size.x
      if (!this.jumping) {
        this.sprite.gotoAndPlay('run')
      }
    }
    this.velocity.x = -this.speed
    this.running    = true
  }

  runRight() {
    if (this.sprite.currentAnimation !== 'run' || this.sprite.scaleX !== 1) {
      this.sprite.scaleX = 1
      this.sprite.regX   = 0
      if (!this.jumping) {
        this.sprite.gotoAndPlay('run')
      }
    }
    this.velocity.x = this.speed
    this.running    = true
  }

  run(keys) {
    this.velocity.x = 0
    this.running    = false
    if (keys[37] && !keys[39]) {
      this.runLeft()
    }
    if (keys[39] && !keys[37]) {
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

    this.sprite.x = this.position.x
    this.sprite.y = this.position.y
  }

  collide() {
    this.grounded = false
    for (let id in this.game.boxes) {
      let box = this.game.boxes[id]
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
    for (let id in this.game.goodies) {
      let goodie = this.game.goodies[id]
      if (this.game.colCheck(this, goodie)) {
        this.score++
        this.scoreBoardContainer.updateScore()
        this.game.goodieContainer.removeGoodie(goodie.id)
        window.socket.emit('scored')
      }
    }
  }
}
