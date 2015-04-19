import BoxContainer    from './box'
import GoodieContainer from './goodie'
import Player          from './player'
import physics         from '../physics'
import config          from '../config'

export default class GameCore {
  constructor(options) {
    this.id            = options.id
    this.world         = {
      gravity: 0.3
    , x:       options.world.x
    , y:       options.world.y
    }

    this.boxContainer    = new BoxContainer(this, options.world.boxes)
    this.goodieContainer = new GoodieContainer(this, options.world.goodies)
    this.boxes           = this.boxContainer.boxes
    this.goodies         = this.goodieContainer.goodies

    this.canvas        = document.createElement('canvas')
    this.canvas.id     = 'game'
    this.canvas.width  = this.world.x
    this.canvas.height = this.world.y
    this.stage         = new createjs.Stage(this.canvas)

    this.players       = {
      self:  new Player(this, false)
    , other: new Player(this, true)
    }

    this.localTime             = 0
    this._deltaTime            = new Date().getTime()
    this._lastDeltaTime        = new Date().getTime()

    this._physicsDeltaTime     = new Date().getTime()
    this._lastPhysicsDeltaTime = new Date().getTime()

    this.startPhysics()
  }

  updatePhysics() {
    physics.changePosition(this.players.self, this._physicsDeltaTime)
    physics.collide(this.players.self)
    physics.enforceBoundingBox(this.players.self)
    physics.handleInput(this.players.self)
  }

  startPhysics() {
    setInterval(() => {
      this._physicsDeltaTime     = (new Date().getTime() - this._lastPhysicsDeltaTime) / 1000
      this._lastPhysicsDeltaTime = new Date().getTime()
      this.updatePhysics()
    }, config.client.physicsRate)
  }

  init() {
    document.body.appendChild(this.canvas)
    this.stage.addChild(this.boxContainer, this.goodieContainer)

    this.players.self.addToStage(false)
    this.players.other.addToStage(true)
  }

  drawPlayers(delta) {
    this.players.self.draw(delta)
    this.players.other.draw(delta)
  }
}
