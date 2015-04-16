import BoxContainer    from './box'
import GoodieContainer from './goodie'
import Player          from './player'

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
  }

  init() {
    document.body.appendChild(this.canvas)
    this.boxContainer.addToStage()
    this.goodieContainer.addToStage()

    this.players.self.addToStage(false)
    this.players.other.addToStage(true)
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
