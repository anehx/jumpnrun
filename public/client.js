jQuery(function($) {
    "use strict";

    var fps    = 60
    var server = 'http://localhost:3000'


    var keys = []

    var game = new GameCore()
    game.socket = io.connect(server)
    game.players.other.img.src = 'public/images/luigi.png'

    game.socket.on('state', function(state) {
        game.state = state
    })

    game.socket.on('goodies', function(goodies) {
        for (var i = 0; i < goodies.length; i++) {
            game.goodies = []
            var goodie = new Goodie(goodies[i])
            game.goodies.push(goodie)
        }
    })

    game.socket.on('boxes', function(boxes) {
        game.boxes = boxes
    })

    game.socket.on('type', function(type) {
        game.players.self.img.src = 'public/images/luigi.png'
        game.players.other.img.src = 'public/images/mario.png'
    })

    function animate(now) {
        if (game.goodies !== [] && game.boxes !== null) {
            game.players.self.walk(keys)
            game.players.self.collectGoodie()
            game.animate(now)
        }
        requestNextAnimationFrame(animate)
    }

    $(document).keypress(function(e) {
        switch(e.keyCode) {
            case 38: // up arrow
                if (!game.players.self.jumping && game.players.self.grounded) {
                    game.players.self.jumping = true
                    game.players.self.grounded = false
                    game.players.self.velocity.y = -game.players.self.jump
                }
                else if (!game.players.self.dblJump) {
                    game.players.self.dblJump = true
                    game.players.self.velocity.y = -game.players.self.jump * 0.8
                }
                break
            case 40: // down arrow
                if (game.players.self.jumping && !game.players.self.grounded) {
                    game.players.self.velocity.y = game.players.self.stomp
                }
                break

            default: return
        }
        e.preventDefault()
    })

    document.body.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    })
    document.body.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    })

    function sendPos() {
        if (game.state == 'play') {
            game.socket.emit('move', {
                position: game.players.self.position,
                walking: game.players.self.walking,
                jumping: game.players.self.jumping,
                frameIndex: game.players.self.frameIndex
            })
        }
    }

    game.socket.on('updatePos', function(data) {
        game.players.other.position = data.position
        game.players.other.walking = data.walking
        game.players.other.jumping = data.jumping
        game.players.other.frameIndex = data.frameIndex
    })

    game.socket.on('updateScore', function(data) {
        game.players.other.score = data.other_score
        game.players.self.score = data.self_score
    })

    game.socket.on('joined', function() {
        game.state = 'play'
    })

    game.socket.on('resetscore', function() {
        game.players.other.score = 0
        game.players.self.score  = 0
    })


    setInterval(sendPos, 1000/fps)
    requestNextAnimationFrame(animate)
})
