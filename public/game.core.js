/*jshint strict:false */

function GameCore() {
    // game core
    this.gravity = 1
    this.state   = 'wait'
    this.goodies = []
    this.socket  = null
    this.boxes   = null
    this.world   = {
        x: 1000,
        y: 500
    }

    this.canvas  = document.getElementById('game')
    this.ctx     = this.canvas.getContext('2d')

    this.players = {
        self:  new Player(this),
        other: new Player(this)
    }
}

GameCore.prototype = {
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
        this.ctx.fillStyle = 'black'
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
        this.drawPlayers()
    },

    animate: function() {
        if (this.state == 'play') {
            this.draw()
        }
        else if (this.state == 'wait') {
            this.clearScreen()
            this.drawText(20, this.world.y - 40, 25, 'Waiting for opponent...')
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
    this.size                = {x: 32, y: 40}
    this.position            = {x: 0,  y: this.game.world.y - this.size.y}
    this.score               = 0
    this.id                  = null

    // moving variables
    this.speed               = 6
    this.jump                = 16
    this.stomp               = 20

    // states
    this.jumping             = false
    this.doubleJump          = false
    this.grounded            = true
    this.color               = null

    // player style
    this.img                 = new Image()
}

Player.prototype = {
    setColor: function(color) {
        this.color   = color
        this.img.src = 'public/images/'+color+'-player-right.png'
    },

    move: function() {
        this.velocity.y += this.game.gravity
        this.position.y = this.position.y + this.velocity.y
        this.position.x = this.position.x + this.velocity.x
    },

    draw: function(now) {
        this.move()
        this.collide()
        this.enforceBoundingBox()
        this.collectGoodie()
        this.game.ctx.drawImage(this.img, this.position.x, this.position.y)
        this.game.drawText(this.position.x + 30, this.position.y - 10, 11, 'Score: ' + this.score)
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
        if (this.position.y + this.size.y > this.game.world.y) {
            this.position.y = this.game.world.y - this.size.y
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
                this.speed += 0.1
                this.score++
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
}
