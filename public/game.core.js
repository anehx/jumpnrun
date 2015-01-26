/*jshint strict:false */

function GameCore() {
    // game core
    this.gravity = 0.3
    this.state   = 'wait'
    this.goodies = []
    this.socket  = null
    this.boxes   = null
    this.bullets = []
    this.dt      = new Date().getTime()
    this.world   = {
        x: 1000,
        y: 500
    }
    this.volume  = 1

    this.canvas  = document.getElementById('game')
    this.ctx     = this.canvas.getContext('2d')

    this.players = {
        self:  new Player(this),
        other: new Player(this)
    }

    this.pattern = new Image()
    this.pattern.src = 'public/images/pattern.png'
    this.pat = this.ctx.createPattern(this.pattern, 'repeat')

}

GameCore.prototype = {
    countdownGoodies: function(now) {

        for (var i = 0; i < this.goodies.length; i++) {
            var goodie = this.goodies[i]
            goodie.timeLeft -= (this.dt - now) / 100000000000
        }
    },
    drawText: function drawText(x, y, size, text){
        this.ctx.fillStyle = 'rgb(0,0,0)';
        this.ctx.font = size + 'px Monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
    },

    clearScreen: function() {
        this.ctx.clearRect(0, 0, this.world.x, this.world.y)
    },

    drawBoxes: function() {
        this.ctx.fillStyle = this.pat
        this.ctx.beginPath()
        for (var i = 0; i < this.boxes.length; i++) {
            var box = this.boxes[i]
            this.ctx.rect(box.position.x, box.position.y, box.size.x, box.size.y)
        }
        this.ctx.fill()
    },

    drawGoodie: function() {
        for (var i = 0; i < this.goodies.length; i++) {
            var goodie = this.goodies[i]
            this.ctx.drawImage(goodie.img, goodie.position.x, goodie.position.y)
            this.drawText(goodie.position.x+ goodie.size.x, goodie.position.y - 10, 10, Math.floor(goodie.timeLeft/1000 - 2))
            this.ctx.drawImage(goodie.img, goodie.position.x, goodie.position.y)
        }
    },

    drawPlayers: function(now) {
        this.players.self.draw(now)
        this.players.other.draw(now)
    },

    draw: function(now) {
        this.clearScreen()
        this.drawBoxes()
        this.drawGoodie()
        this.drawPlayers(now)
        this.countdownGoodies(now)
    },

    animate: function(now) {
        if (this.state == 'play') {
            this.draw(now)
        }
        else if (this.state == 'wait') {
            this.clearScreen()
            this.drawText(50, this.world.y - 100, 25, 'Waiting for opponent...')
        }
    },

    colCheck: function(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.position.x + (shapeA.size.x / 2)) - (shapeB.position.x + (shapeB.size.x / 2))
        var vY = (shapeA.position.y + (shapeA.size.y / 2)) - (shapeB.position.y + (shapeB.size.y / 2))
        // add the half widths and half heights of the objects
        var hWidths  = (shapeA.size.x / 2) + (shapeB.size.x / 2)
        var hHeights = (shapeA.size.y / 2) + (shapeB.size.y / 2)
        var colDir = null

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX)
            var oY = hHeights - Math.abs(vY)
            if (oX >= oY) {
                // figures out on which side we are colliding (top, bottom, left, or right)
                if (vY > 0) {
                    colDir = "t"
                    shapeA.position.y += oY
                }
                else {
                    colDir = "b"
                    shapeA.position.y -= oY
                }
            }
            else {
                if (vX > 0) {
                    colDir = "l"
                    shapeA.position.x += oX
                }
                else {
                    colDir = "r"
                    shapeA.position.x -= oX
                }
            }
        }
        return colDir
    }
}

function Player(game) {
    // current instances
    this.game                = game

    this.velocity            = {x: 0,  y: 0}
    this.size                = {x: 26, y: 40}
    this.position            = {x: 0,  y: this.game.world.y - this.size.y}
    this.score               = 0
    this.id                  = null
    this.lastUpdate          = 0
    this.updateDelta         = 0

    // moving variables
    this.speed               = 3
    this.jump                = 8
    this.stomp               = 15

    // states
    this.jumping             = false
    this.doubleJump          = false
    this.grounded            = true
    this.color               = null

    // player style
    this.img                 = new Image()
    this.img.src             = 'public/images/mario.png'
    this.frame               = 0
    this.frameIndex          = 0
    this.walking             = false
}

Player.prototype = {
    walk: function(keys) {
        this.velocity.x = 0
        this.walking = false
        if (keys[37]) {
            this.velocity.x = -this.speed
            this.walking = true
            this.frameIndex = 4
        }
        if (keys[39]) {
            this.velocity.x = this.speed
            this.walking = true
            this.frameIndex = 0
        }
    },

    move: function(now) {
        var delta = (this.game.dt - now) / 1000000000000

        this.velocity.y += this.game.gravity * delta
        this.position.y = this.position.y + this.velocity.y * delta
        this.position.x = this.position.x + this.velocity.x * delta
    },

    draw: function(now) {
        this.move(now)
        this.collide()
        this.enforceBoundingBox()
        this.game.drawText(this.position.x + this.size.x, this.position.y - 10, 11, 'Score: ' + this.score)


        if (this.jumping) {
            this.frame = 3 + this.frameIndex
        }
        else if (this.walking) {
            var delta = Date.now() - this.lastUpdate
            if (this.updateDelta > 100) {
                this.updateDelta = 0
                if (this.frame - this.frameIndex < 2 && this.game.dt >= 3) {
                    if (this.frameIndex == 4) {
                        this.frame = 5
                    }
                    this.frame++
                }
                else {
                    this.frame = this.frameIndex
                }
            }
            else {
                this.updateDelta += delta
            }
        }
        else if (this.grounded) {
            this.frame = this.frameIndex
        }
        this.lastUpdate = Date.now()

        this.game.ctx.save()
        if (this.dir == -1) {
            this.game.ctx.translate(-this.img.width, 0)
            this.game.ctx.scale(this.dir, 1)
        }
        this.game.ctx.drawImage(
            this.img,
            this.frame*this.size.x,
            0,
            this.size.x,
            this.size.y,
            this.position.x,
            this.position.y,
            this.size.x,
            this.size.y
        )
        this.game.ctx.restore()
    },

    collide: function() {
        this.grounded = false
        for (var i = 0; i < this.game.boxes.length; i++) {
            var dir = this.game.colCheck(this, this.game.boxes[i])
            if (dir === "l" || dir === "r") {
                this.velocity.x = 0
                this.jumping = false
                this.dblJump = false
            } else if (dir === "b") {
                this.grounded = true
                this.jumping = false
                this.dblJump = false
            } else if (dir === "t") {
                this.velocity.y = this.game.gravity * 2
            }
        }
        if (this.grounded) {
            this.velocity.y = 0
        }
    },

    enforceBoundingBox: function() {
        if (this.position.x + this.size.x > this.game.world.x) {
            this.position.x = this.game.world.x - this.size.x
        }
        else if (this.position.x < 0) {
            this.position.x = 0
        }
        if (this.position.y + this.size.y + 12 > this.game.world.y) {
            this.position.y = this.game.world.y - this.size.y - 12
            this.velocity.y = 0
            this.jumping = false
            this.grounded = true
            this.dblJump = false
        }
        else if (this.position.y < 0) {
            this.velocity.y = this.game.gravity * 2
        }
    },

    collectGoodie: function() {
        for (var i = 0; i < this.game.goodies.length; i++) {
            var goodie = this.game.goodies[i]
            if (this.game.colCheck(this, goodie)) {
                ion.sound.play('coin', {volume: (0.5 * this.game.volume)})
                this.game.goodies.length = 0
                this.game.socket.emit('scored')
            }
        }
    }
}

function Goodie(position) {
    this.size     = {x: 10, y: 10}
    this.img      = new Image()
    this.img.src  = 'public/images/star.png'
    this.position = position
    this.timeLeft = position.timeLeft
}
