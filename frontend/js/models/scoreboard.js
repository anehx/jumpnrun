export default class ScoreBoardContainer extends createjs.Container {
  constructor(player, flipped) {
    super()

    this.player     = player
    this.scoreboard = new ScoreBoard(player, flipped)

    this.addChild(this.scoreboard, this.scoreboard.name, this.scoreboard.score)
  }

  addToStage() {
    this.cache(
      this.scoreboard.position.x
    , this.scoreboard.position.y
    , this.scoreboard.size.x
    , this.scoreboard.size.y
    )
    this.player.game.stage.addChild(this)
  }

  updateScore() {
    this.scoreboard.updateScore()
    this.updateCache()
  }
}

class ScoreBoard extends createjs.Shape {
  constructor(player, flipped) {
    super()

    this.player      = player
    this.textColor   = '#000000'
    this.padding     = 10
    this.innerRadius = 15
    this.outerRadius = 25
    this.boxWidth    = 175
    this.font        = 'bold 12px sans-serif'
    this.textShadow  = new createjs.Shadow('#AAAAAA', 0, 0, 2)
    this.scaleX      = flipped ? -1 : 1
    this.regX        = flipped ? this.player.game.world.x : 0

    this.size        = {
      x: this.padding * 2 + this.innerRadius + this.outerRadius + this.boxWidth
    , y: this.padding * 2 + this.outerRadius * 2
    }

    this.position    = {
      x: flipped ? this.regX - this.size.x : 0
    , y: 0
    }

    // background
    this.graphics.beginFill('#DDDDDD')
    this.shapePath()
    this.graphics.endFill()

    // first stroke
    this.graphics.beginStroke('#888888')
    this.graphics.setStrokeStyle(5)
    this.shapePath()
    this.graphics.endStroke()

    // second stroke
    this.graphics.beginStroke('#000000')
    this.graphics.setStrokeStyle(2)
    this.shapePath()
    this.graphics.endStroke()

    // player color circle
    this.graphics.beginFill(this.player.color)
    this.graphics.arc(
      this.padding + this.innerRadius
    , this.padding + this.outerRadius
    , this.innerRadius
    , 0, 2 * Math.PI
    )
    this.graphics.endFill()

    // background shadow
    this.shadow = new createjs.Shadow('#AAAAAA', 0, 0, 5)

    // name text
    this.name            = new createjs.Text(this.player.name, this.font, this.textColor)
    this.name.textAlign  = 'center'
    this.name.x          = Math.abs(this.regX - 130)
    this.name.y          = 23
    this.name.shadow     = this.textShadow

    // score text
    this.score           = new createjs.Text(`Score: ${this.player.score}`, this.font, this.textColor)
    this.score.textAlign = 'center'
    this.score.x         = Math.abs(this.regX - 130)
    this.score.y         = 40
    this.score.shadow    = this.textShadow
  }

  shapePath() {
    this.graphics.arc(
      this.padding + this.innerRadius
    , this.padding + this.outerRadius
    , this.outerRadius
    , 1.5 * Math.PI, 0.5 * Math.PI
    ).lt(
      this.boxWidth + this.innerRadius + this.padding
    , this.padding + this.outerRadius * 2
    ).mt(
      this.padding + this.innerRadius
    , this.padding
    ).lt(
      this.boxWidth + this.innerRadius + this.padding
    , this.padding
    ).arc(
      this.boxWidth + this.innerRadius + this.padding
    , this.padding + this.outerRadius
    , this.outerRadius
    , 1.5 * Math.PI, 0.5 * Math.PI
    )
  }

  updateScore() {
    this.score.text = `Score: ${this.player.score}`
  }
}
