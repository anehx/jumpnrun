class BoxContainer extends createjs.Container {
  constructor(game, rawBoxes) {
    super()

    this.game  = game
    this.boxes = []

    rawBoxes.forEach(i => {
      let box = new Box(i)

      this.boxes[box.id] = box
      this.addChild(box)
    })
  }

  addToStage() {
    this.cache(0, 0, this.game.world.x, this.game.world.y)
    this.game.stage.addChild(this)
  }
}

class Box extends createjs.Shape {
  constructor(data) {
    super()

    this.id       = data.id
    this.position = data.position
    this.size     = data.size
    this.color    = '#000000'

    this.graphics.beginFill(this.color)
    this.graphics.drawRect(this.position.x, this.position.y, this.size.x, this.size.y)
    this.graphics.endFill()
  }
}
