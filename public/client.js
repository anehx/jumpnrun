$(function() {
    "use strict";

    game = new GameCore()
    game.socket = io.connect('http://10.9.5.220:3000')

    game.socket.on('state', function(state) {
        game.state = state
        console.log(state)
    })

    game.socket.on('getgoodie', function(goodie) {
        game.goodie = new Goodie(goodie)
    })

    game.socket.on('getboxes', function(boxes) {
        game.boxes = boxes
    })

    function animate() {
        if (game.goodie !== null && game.boxes !== null) {
            game.animate()
        }
        requestNextAnimationFrame(animate)
    }

    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left arrow
                game.players.self.velocity.x = -game.players.self.speed
                game.players.self.img.src = 'public/images/red-player-left.png'
                break

            case 38: // up arrow
                if(!game.players.self.jumping && game.players.self.grounded) {
                    game.players.self.jumping = true
                    game.players.self.grounded = false
                    game.players.self.velocity.y = -game.players.self.jump
                }
                else if (!game.players.self.dblJump) {
                    game.players.self.dblJump = true
                    game.players.self.velocity.y = -game.players.self.jump * 0.8
                }
                break

            case 39: // right arrow
                game.players.self.velocity.x = game.players.self.speed
                game.players.self.img.src = 'public/images/red-player-right.png'
                break

            case 40: // down arrow
                if(game.players.self.jumping && !game.players.self.grounded) {
                    game.players.self.velocity.y = game.players.self.stomp
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
                game.players.self.velocity.x = 0
                break

            default: return
        }
        e.preventDefault()
    })

    function sendPos() {
        game.socket.emit('sendPos', {position: game.players.self.position})
    }

    game.socket.on('updatePos', function(data) {
        game.players.other.position = data.position
    })

    game.socket.on('scored', function() {
        game.players.other.score++
    })

    game.socket.on('resetscore', function() {
        game.players.other.score = 0
        game.players.self.score = 0
    })

    setInterval(sendPos, 10)
    requestNextAnimationFrame(animate)
})
