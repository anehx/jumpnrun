'use strict'

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
                this.game.goodies.length = 0
                this.game.socket.emit('scored')
            }
        }
    }
}
