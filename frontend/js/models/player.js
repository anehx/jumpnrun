import ScoreBoardContainer    from './scoreboard'
import physics                from '../physics'
import { keys, initKeypress } from '../input'
import socket                 from '../socket'

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
        images: [ 'images/stickman.png' ]
      , frames: { width: 19, height: 32, count: 9 }
      , animations: {
          idle: 0
        , jump: 8
        , run:  [ 1, 8, 'run', 0.4 ]
      }
    })
    this.sprite      = new createjs.Sprite(this.spritesheet)
  }

  beforeDraw() {
    this.sprite.x      = this.position.x
    this.sprite.y      = this.position.y
    this.sprite.regX   = this.velocity.x < 0 ? this.size.x : 0
    this.sprite.scaleX = this.velocity.x < 0 ? -1          : 1

    if (this.state.jump) {
      if (this.sprite.currentAnimation !== 'jump') {
        this.sprite.gotoAndPlay('jump')
      }
    }
    else if (this.state.running) {
      if (this.sprite.currentAnimation !== 'run') {
        this.sprite.gotoAndPlay('run')
      }
    }
    else if (this.sprite.currentAnimation !== 'idle') {
      this.sprite.gotoAndPlay('idle')
    }
  }

  addToStage(flipped) {
    this.sprite.gotoAndPlay('idle')
    this.sprite.shadow = new createjs.Shadow(this.color, 0, 0, 2)
    this.scoreBoardContainer = new ScoreBoardContainer(this, flipped)
    this.scoreBoardContainer.addToStage()
    this.game.stage.addChild(this.sprite)
  }

  collectGoodie(id) {
    this.score++
    this.scoreBoardContainer.updateScore()
    this.game.goodieContainer.removeGoodie(id)
    socket.emit('scored')
  }
}
