(function(document, $) {
    "use strict";
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var canvas = document.getElementById('game')
    var ctx = canvas.getContext('2d')

    var maxJump = 20
    var maxFall = 5

    function Player() {
        this.size     = {x: 40, y: 40}
        this.position = {x: 0, y: 0}
        this.velocity = {x: 0, y: 0}
        this.speed    = 5
        this.jump     = 10
        this.stomp    = 15
        this.gravity  = 0.5
        this.jumping  = false
        this.img      = new Image()
        this.img.src  = 'images/player.png'
    }

    Player.prototype.move = function(timeElapsed) {
        this.position.x += this.velocity.x * timeElapsed
        this.position.y += this.velocity.y * timeElapsed
    }

    function render() {
        ctx.clearRect(0,0,1000,600);
        ctx.drawImage(player.img, player.position.x, player.position.y)
    }

    var player = new Player()

    var keysDown = {}

    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true
    }, false)

    addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode]
    }, false)

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
        }
        else if (player.position.y < 0) {
            player.position.y = 0
        }
    }

    function update(modifier) {
        player.velocity.x = 0
        if (37 in keysDown) { // Player holding left
            player.velocity.x = -player.speed;
        }
        if (39 in keysDown) { // Player holding right
            player.velocity.x = player.speed;
        }


        player.velocity.y += player.gravity
        move(modifier)
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
            'velX: ' + player.velocity.x + '\t\t' + 'velY: ' + player.velocity.y +
            '<br>posX: ' + player.position.x + '\t\t' +  'posY: ' + player.position.y +
            '<br>Jumping?: ' + player.jumping
        )

        then = now
        requestAnimationFrame(main)
    }

    function key(keycode) {
        switch(keycode.key) {
            case 'ArrowUp':
            case 'Up':
                if(!player.jumping) {
                    player.jumping = true
                    player.velocity.y = -player.jump
                }
                break
            case 'ArrowDown':
            case 'Down':
                player.velocity.y = player.stomp
                break
        }
    }

    var then = Date.now()
    main()
    $(document).keypress(key)

})(document, jQuery);
