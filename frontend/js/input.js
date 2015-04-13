window.initKeypress = function() {
  window.listener = new window.keypress.Listener()
  window.keys = []

  listener.register_combo({
    keys: 'up'
  , on_keydown: function() {
      gameCore.players.self.jump()
    }
  , prevent_default: true
  })

  listener.register_combo({
    keys: 'down'
  , on_keydown: function() {
      gameCore.players.self.stomp()
    }
  , prevent_default: true
  })

  listener.register_combo({
    keys: 'left'
  , on_keydown: function(e, count, auto) {
      if (!auto) {
        keys[e.keyCode] = true
      }
    }
  , on_keyup: function(e) {
      delete keys[e.keyCode]
    }
  , prevent_default: true
  })

  listener.register_combo({
    keys: 'right'
  , on_keydown: function(e, count, auto) {
      if (!auto) {
        keys[e.keyCode] = true
      }
    }
  , on_keyup: function(e) {
      delete keys[e.keyCode]
    }
  , prevent_default: true
  })
}
