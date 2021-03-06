export let keys = []

export function initKeypress() {
  let listener = new window.keypress.Listener()

  listener.register_combo({
    keys: 'up'
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
    keys: 'down'
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
