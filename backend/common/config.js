const config = {
  server: {
    port:        3000
  , url:         'http://jumpnrun.vm'
  , physicsRate: 15
  , stateRate:   1000 / 45
  }

, client: {
    fps:         60
  , physicsRate: 15
  }

, world: {
    x:     1024
  , y:     768
  , areas: 8
  }

, boxes: {
    padding:    50
  , minPerArea:  2
  , maxPerArea:  4
  , minWidth:   60
  }

, goodies: {
    count:     1
  , timeLeft: 15 * 1000
  }

, physics: {
    gravity: 30
  , bounce:  0.8
  }

, player: {
    jumpDecay:   0.8
  , jumpSpeed:  100
  , stompSpeed: 100
  , runSpeed:    30
  }
}

export default config
