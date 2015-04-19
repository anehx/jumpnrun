import ScoreBoardContainer    from './scoreboard'
import physics                from '../physics'
import { keys, initKeypress } from '../input'

export default class Player {
  constructor(game) {
    this.game        = game
    this.velocity    = { x: 0,  y: 0 }
    this.size        = { x: 19, y: 32 }
    this.position    = { x: 0,  y: game.world.y - this.size.y }
    this.score       = 0
    this.keys        = keys

    initKeypress()

    this.speed       = 3
    this.jumpVelocity = 8
    this.stompVelocity = 15

    this.state = {
      jump:     0
    , running:  false
    , grounded: true
    }

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

  draw(delta) {
    this.move(delta)
    this.collide()
    this.enforceBoundingBox()
    this.collectGoodie()

    this.sprite.x = this.position.x
    this.sprite.y = this.position.y
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
