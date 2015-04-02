var data = {
    images: ['images/stickman.png'],
    frames: {width:64, height:64},
    animations: {
        run:[1,2,3,4,5,6,7,8]
    }
}
var spriteSheet = new createjs.SpriteSheet(data)
var run = new createjs.Sprite(spriteSheet, 'run')
