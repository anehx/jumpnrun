class GoodieContainer extends createjs.Container {
  constructor(game, rawGoodies) {
    super()

    this.game    = game
    this.goodies = []

    rawGoodies.forEach(i => {
      let goodie = new Goodie(i)

      this.goodies[goodie.id] = goodie
      this.addChild(goodie, goodie.text)
    })

  }

  removeGoodie(id) {
    let goodie = this.goodies[id]

    this.removeChild(goodie, goodie.text)
    delete this.goodies[id]

    this.updateCache()
  }

  updateGoodieTime(id, time) {
    let goodie = this.goodies[id]

    goodie.timeLeft = time
    goodie.updateText()

    this.updateCache()
  }

  addToStage() {
    this.cache(0, 0, this.game.world.x, this.game.world.y)
    this.game.stage.addChild(this)
  }

  updateGoodies(data) {
    this.removeAllChildren()
    data.forEach(i => {
      let goodie = new Goodie(i)

      this.goodies[goodie.id] = goodie
      this.addChild(goodie, goodie.text)
    })
    this.updateCache()
  }
}

class Goodie extends createjs.Bitmap {
  constructor(data) {
    super(loader.getResult('goodie_tile'))

    this.id       = data.id
    this.position = data.position
    this.size     = data.size
    this.timeLeft = data.timeLeft
    this.text     = new createjs.Text(this.timeLeft / 1000, '10px sans-serif', this.color)
    this.text.align = 'center'
    this.text.x   = this.position.x
    this.text.y   = this.position.y - this.size.y
    this.x        = this.position.x
    this.y        = this.position.y
    this.shadow   = new createjs.Shadow('#FFA500', 1, 1, 3)
  }

  updateText() {
    this.text.text = this.timeLeft / 1000
  }

}