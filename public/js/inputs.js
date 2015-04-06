$(function() {
  'use strict'
  window.keys   = []

  $(document).keypress(function(e) {
    switch(e.keyCode) {
      case 38: // up arrow
        if (!gameCore.players.self.jumping && gameCore.players.self.grounded) {
          gameCore.players.self.jumping = true
          gameCore.players.self.grounded = false
          gameCore.players.self.velocity.y = -gameCore.players.self.jump
        }
        else if (!gameCore.players.self.dblJump) {
          gameCore.players.self.dblJump = true
          gameCore.players.self.velocity.y = -gameCore.players.self.jump * 0.8
        }
        break

      case 40: // down arrow
        if (gameCore.players.self.jumping && !gameCore.players.self.grounded) {
          gameCore.players.self.velocity.y = gameCore.players.self.stomp
        }
        break

      default: return
    }
    e.preventDefault()
  })

  document.body.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
  })
  document.body.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
  })

})
