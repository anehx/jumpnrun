import socket from './socket'

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

  listener.register_combo({
    keys: 'esc'
  , on_keydown: function(e, count, auto) {
      if ($('.menu').height() === 0) {
        $('.menu').animate({ height: '80%', padding: '10px', opacity: 1 })
      }
      else {
        $('.menu').animate({ height: 0, padding: 0, opacity: 0 })
      }
    }
  , prevent_default: true
  , prevent_repeat: true
  })

  listener.register_combo({
    keys: 'o'
  , on_keydown: function(e, count, auto) {
      if ($('.menu').height() !== 0) {
        let sel = $('.menu-button.selected')
        let el  = sel.prev()
        if (el.length) {
          el.addClass('selected')
          sel.removeClass('selected')
        }
      }
    }
  , prevent_default: true
  , prevent_repeat: true
  })

  listener.register_combo({
    keys: 'p'
  , on_keydown: function(e, count, auto) {
      if ($('.menu').height() !== 0) {
        let sel = $('.menu-button.selected')
        let el  = sel.next()
        if (el.length) {
          el.addClass('selected')
          sel.removeClass('selected')
        }
      }
    }
  , prevent_default: true
  , prevent_repeat: true
  })

  listener.register_combo({
    keys: 'l'
  , on_keydown: function(e, count, auto) {
      if ($('.menu').height() !== 0) {
        $('.menu-button.selected').click()
      }
    }
  , prevent_default: true
  , prevent_repeat: true
  })
}
