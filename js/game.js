(function(document, $) {
    "use strict";

    var canvas                 = document.getElementById('game')
    var ctx                    = canvas.getContext('2d')
    var fps                    = 0
    var lastAnimationFrameTime = 0
    var lastFpsUpdateTime      = 0
    var goodie

    function draw() {
        player.move()
        player.collide()
        player.collectGoodie()
        player.enforceBoundingBox()

        ctx.clearRect(0,0,1280,720)
        player.draw()
        drawBoxes()
        goodie.draw()
    }

    function debug() {
        var elements = [
            {
                name : 'posX',
                content : player.position.x.toFixed(0)
            },
            {
                name : 'posY',
                content : player.position.y.toFixed(0)
            },
            {
                name : 'velX',
                content : player.velocity.x.toFixed(0)
            },
            {
                name : 'velY',
                content : player.velocity.y.toFixed(0)
            }
        ]

        var txt = ''
        for (var i = 0; i < elements.length; i++) {
            txt += '<br>' + elements[i].name + ': ' + elements[i].content
        }
        //debugWindow.html(txt)
    }

    function animate(now) {
        fps = calculateFps(now)
        draw()
        debug()
        requestNextAnimationFrame(animate)
    }

    function Player() {
        this.size     = {x: 26, y: 40}
        this.position = {x: 0, y: 460}
        this.velocity = {x: 0, y: 0}
        this.speed    = 6
        this.jump     = 16
        this.stomp    = 20
        this.gravity  = 1
        this.jumping  = false
        this.dblJump  = false
        this.grounded = true
        this.score    = 0
        this.img      = new Image()
        this.img.src  = 'images/player-right.png'
    }

    function createGoodie() {
        goodie = new Goodie({
            x: Math.floor(Math.random() * canvas.width),
            y: Math.floor(Math.random() * 9 + 1) * canvas.height/10 - 25
        })
    }


    Player.prototype = {
        move: function() {
            // add gravity
            this.velocity.y += this.gravity

            // actual movement
            this.position.x = this.position.x + this.velocity.x
            this.position.y = this.position.y + this.velocity.y
        },

        draw: function() {
            ctx.drawImage(this.img, this.position.x - 3, this.position.y)
            ctx.font = '15px monospace'
            ctx.fillText('Score: ' + this.score, 10, 20)
        },

        collide: function() {
            this.grounded = false
            for (var i = 0; i < boxes.length; i++) {
                var dir = colCheck(this, boxes[i])
                if (dir === "l" || dir === "r") {
                    this.velocity.x = 0
                    this.jumping = false
                    this.dblJump = false
                } else if (dir === "b") {
                    this.grounded = true
                    this.jumping = false
                    this.dblJump = false
                } else if (dir === "t") {
                    this.velocity.y = this.gravity * 2
                }
            }
            if (this.grounded) {
                this.velocity.y = 0
            }
        },

        enforceBoundingBox: function() {
            if (this.position.x + 3 + this.size.x > canvas.width) {
                this.position.x = canvas.width - this.size.x - 3
            }
            else if (this.position.x - 3 < 0) {
                this.position.x = 3
            }
            if (this.position.y + this.size.y > canvas.height) {
                this.position.y = canvas.height - this.size.y
                this.velocity.y = 0
                this.jumping = false
                this.grounded = true
                this.dblJump = false
            }
            else if (this.position.y < 0) {
                this.velocity.y = this.gravity * 2
            }
        },

        collectGoodie: function() {
            if (colCheck(this, goodie)) {
                goodie = null
                createGoodie()
                this.score += 1
            }
        }
    }

    function Box(position, size) {
        if (typeof size === 'undefined') {
            size = {x: 200, y: 12}
        }

        this.position = position
        this.size     = size
        this.color    = 'black'
    }

    Box.prototype = {
        draw: function() {
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.rect(this.position.x, this.position.y, this.size.x, this.size.y)
            ctx.fill()
        }
    }

    function Goodie(position) {
        this.position = position
        this.size = {x: 10, y: 10}
        this.img = new Image()
        this.img.src = 'images/star.png'
    }

    Goodie.prototype = {
        draw: function() {
            ctx.drawImage(this.img, this.position.x, this.position.y)
        }
    }

    var player = new Player()
    var boxes  = []

    function randomBoxes() {
        for (var i = 0; i < 30; i++) {
            boxes.push(
                new Box({
                    x: Math.floor(Math.random() * canvas.width),
                    y: Math.floor(Math.random() * 9 + 1) * canvas.height / 10
                })
            )
        }
    }

    randomBoxes()

    function drawBoxes() {
        for (var i = 0; i < boxes.length; i++) {
            boxes[i].draw()
        }
    }

    function colCheck(shapeA, shapeB) {
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

    function calculateFps(now) {
        var fps = 1000 / (now - lastAnimationFrameTime)
        lastAnimationFrameTime = now

        if (now - lastFpsUpdateTime > 1000) {
            lastFpsUpdateTime = now

            // display fps with colors
            var color
            if (fps >= 60) {
                color = 'green'
            }
            else if (fps >= 30) {
                color = 'orange'
            }
            else if (fps < 30) {
                color = 'red'
            }
            //fpsWindow.html('<font color="' + color + '">' + fps.toFixed(0) + ' fps</font>')
        }

        return fps
    }

    $(document).keydown(function(e) {
        console.log(e.which)
        switch(e.which) {
            case 37: // left arrow
                player.velocity.x = -player.speed
                player.img.src = 'images/player-left.png'
                break

            case 38: // up arrow
                if(!player.jumping && player.grounded) {
                    player.jumping = true
                    player.grounded = false
                    player.velocity.y = -player.jump
                }
                else if (!player.dblJump) {
                    player.dblJump = true
                    player.velocity.y = -player.jump * 0.8
                }
                break

            case 39: // right arrow
                player.velocity.x = player.speed
                player.img.src = 'images/player-right.png'
                break

            case 40: // down arrow
                if(player.jumping && !player.grounded) {
                    player.velocity.y = player.stomp
                }
                break

            default: return
        }
        e.preventDefault()
    })

    $(document).keyup(function(e) {
        switch(e.which) {
            case 39:
            case 37:
                // stop moving left/right if
                // no left/right arrow key is pressed
                player.velocity.x = 0
                break

            default: return
        }
        e.preventDefault()
    })

    requestNextAnimationFrame(animate)
    createGoodie()

})(document, jQuery)
