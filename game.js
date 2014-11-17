(function(document, $) {
    "use strict";
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var canvas = document.getElementById('game')
    var ctx = canvas.getContext('2d')

    var maxJump = 20
    var maxFall = 5

    function Player() {
        this.size     = {x: 32, y: 40}
        this.position = {x: 0, y: 460}
        this.velocity = {x: 0, y: 0}
        this.speed    = 5
        this.jump     = 10
        this.stomp    = 15
        this.gravity  = 0.5
        this.jumping  = false
        this.dblJump  = false
        this.grounded = false
        this.img      = new Image()
        this.img.src  = 'images/player-right.png'
    }

    Player.prototype.move = function(timeElapsed) {
        this.position.x += this.velocity.x * timeElapsed
        this.position.y += this.velocity.y * timeElapsed
    }

    function collide() {
        player.grounded = false
        for (var i = 0; i < boxes.length; i++) {
            var dir = colCheck(player, boxes[i])
            if (dir === "l" || dir === "r") {
                player.velocity.x = 0;
                player.jumping = false;
                player.dblJump = false;
            } else if (dir === "b") {
                player.grounded = true;
                player.jumping = false;
                player.dblJump = false;
            } else if (dir === "t") {
                player.velocity.y = player.gravity * 2;
            }
        }
        if (player.grounded) {
            player.velocity.y = 0
        }
    }

    function render() {
        ctx.clearRect(0,0,1000,600)
        ctx.fillStyle = "black"
        ctx.beginPath()
        for (var i = 0; i < boxes.length; i++) {
            ctx.rect(boxes[i].position.x, boxes[i].position.y, boxes[i].size.x, boxes[i].size.y);
        }
        ctx.fill()

        ctx.save()
        if (player.img.flipped) {
            ctx.scale(-1, 1)
        }
        ctx.drawImage(player.img, player.position.x, player.position.y)
        ctx.restore()
    }

    var player = new Player()
    var boxes = []

    boxes.push({
        position: {x: 500, y: 350},
        size: {x: 200, y: 10}
    })
    boxes.push({
        position: {x: 50, y: 400},
        size: {x: 150, y: 10}
    })
    boxes.push({
        position: {x: 200, y: 200},
        size: {x: 200, y: 10}
    })
    boxes.push({
        position: {x: 10, y: 100},
        size: {x: 150, y: 10}
    })
    boxes.push({
        position: {x: 780, y: 250},
        size: {x: 200, y: 10}
    })
    boxes.push({
        position: {x: 550, y: 100},
        size: {x: 170, y: 10}
    })

    var keysDown = {}

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true
    }, false)

    addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode]
    }, false)

    function colCheck(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.position.x + (shapeA.size.x / 2)) - (shapeB.position.x + (shapeB.size.x / 2))
        var vY = (shapeA.position.y + (shapeA.size.y / 2)) - (shapeB.position.y + (shapeB.size.y / 2))
        // add the half widths and half heights of the objects
        var hWidths  = (shapeA.size.x / 2) + (shapeB.size.x / 2)
        var hHeights = (shapeA.size.y / 2) + (shapeB.size.y / 2)
        var colDir = null;

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX)
            var oY = hHeights - Math.abs(vY)
            if (oX >= oY) {
                // figures out on which side we are colliding (top, bottom, left, or right)
                if (vY > 0) {
                    colDir = "t";
                    shapeA.position.y += oY;
                }
                else {
                    colDir = "b";
                    shapeA.position.y -= oY;
                }
            }
            else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.position.x += oX;
                }
                else {
                    colDir = "r";
                    shapeA.position.x -= oX;
                }
            }
        }
        return colDir;
    }

    function enforceBoundingBox() {
        if (player.position.x + player.size.x > canvas.width) {
            player.position.x = canvas.width - player.size.x
        }
        else if (player.position.x < 0) {
            player.position.x = 0
        }
        if (player.position.y + player.size.y > canvas.height) {
            player.position.y = canvas.height - player.size.y
            player.jumping = false
            player.grounded = true
            player.dblJump = false
        }
        else if (player.position.y < 0) {
            player.velocity.y = player.gravity * 2
        }
    }

    function update(modifier) {
        player.velocity.x = 0
        if (37 in keysDown) { // Player holding left
            player.velocity.x = -player.speed;
            player.img.src = 'images/player-left.png'
        }
        if (39 in keysDown) { // Player holding right
            player.velocity.x = player.speed;
            player.img.src = 'images/player-right.png'
        }

        player.velocity.y += player.gravity

        move(modifier)
        collide()
        enforceBoundingBox()
    }

    function move(modifier) {
        player.position.x = player.position.x + (player.velocity.x * modifier)
        player.position.y = player.position.y + (player.velocity.y * modifier)
    }

    function main() {
        var now = Date.now()
        var delta = now - then

        update(delta / 10)
        render()
        $('.debug').html(
            'velX: ' + player.velocity.x + '      ' + 'velY: ' + player.velocity.y +
            '<br>posX: ' + player.position.x + '      ' +  'posY: ' + player.position.y +
            '<br>Jumping?: ' + player.jumping + '      ' + 'dJumping?: ' + player.dblJump +
            '<br>Grounded?: ' + player.grounded
        )

        then = now
        requestAnimationFrame(main)
    }

    function key(keycode) {
        switch(keycode.keyCode) {
            case 38:
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
            case 40:
                if(player.jumping && !player.grounded) {
                    player.velocity.y = player.stomp
                }
                break
        }
    }

    var then = Date.now()
    main()
    $(document).keypress(key)

})(document, jQuery);
