(function(document, $) {
    "use strict";

    var canvas = document.getElementById('game')
    var ctx    = canvas.getContext('2d')
    var fps
    var lastAnimationFrameTime = 0
    var lastFpsUpdateTime      = 0


    function Player() {
        this.size     = {x: 32, y: 40}
        this.position = {x: 0, y: 460}
        this.velocity = {x: 0, y: 0}
        this.speed    = 8
        this.jump     = 16
        this.stomp    = 20
        this.gravity  = 1
        this.jumping  = false
        this.dblJump  = false
        this.grounded = true
        this.img      = new Image()
        this.img.src  = 'images/player-right.png'
    }

    var player = new Player()
    var boxes  = []

    boxes.push(
        {
            position: {x: 500, y: 350},
            size: {x: 200, y: 10}
        },
        {
            position: {x: 50, y: 400},
            size: {x: 150, y: 10}
        },
        {
            position: {x: 200, y: 200},
            size: {x: 200, y: 10}
        },
        {
            position: {x: 10, y: 100},
            size: {x: 150, y: 10}
        },
        {
            position: {x: 780, y: 250},
            size: {x: 200, y: 10}
        },
        {
            position: {x: 550, y: 100},
            size: {x: 170, y: 10}
        }
    )

    function debug(elements) {
        var txt = ''
        for (var i = 0; i < elements.length; i++) {
            txt += '<br>' + elements[i].name + ': ' + elements[i].content
        }
        $('.debug').html(txt)
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


    function drawPlayer() {
        ctx.drawImage(player.img, player.position.x, player.position.y)
    }

    function drawBoxes() {
        ctx.fillStyle = "black"
        ctx.beginPath()
        for (var i = 0; i < boxes.length; i++) {
            ctx.rect(boxes[i].position.x, boxes[i].position.y, boxes[i].size.x, boxes[i].size.y);
        }
        ctx.fill()
    }

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
            player.velocity.y = 0
            player.jumping = false
            player.grounded = true
            player.dblJump = false
        }
        else if (player.position.y < 0) {
            player.velocity.y = player.gravity * 2
        }
    }

    function draw() {
        player.velocity.x = 0

        if (37 in keysDown) {
            player.velocity.x = -player.speed;
            player.img.src = 'images/player-left.png'
        }
        if (39 in keysDown) {
            player.velocity.x = player.speed;
            player.img.src = 'images/player-right.png'
        }

        player.velocity.y += player.gravity

        movePlayer()
        enforceBoundingBox()
        ctx.clearRect(0,0,1000,600)
        drawPlayer()
        drawBoxes()
    }

    function movePlayer() {
        player.position.x = player.position.x + player.velocity.x
        player.position.y = player.position.y + player.velocity.y
        collide()
    }

    function animate(now) {
        fps = calculateFps(now)
        draw()

        debug([
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
        ])

        requestNextAnimationFrame(animate)
    }

    function calculateFps(now) {
        var fps = 1000 / (now - lastAnimationFrameTime);
        lastAnimationFrameTime = now;

        if (now - lastFpsUpdateTime > 1000) {
            lastFpsUpdateTime = now
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
            $('.fps').html('<font color="' + color + '">' + fps.toFixed(0) + ' fps</font>')
        }

        return fps
    }

    $(document).keydown(function(e) {
        switch(e.which) {
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

            default: return
        }
    })

    requestNextAnimationFrame(animate)

})(document, jQuery);
