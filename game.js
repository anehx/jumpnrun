(function(document, $) {
    "use strict";

    var deltaLeftRight =  4;
    var deltaJump      = 15.0;
    var deltaStomp     = 20.0;
    var deltaFall      =  0.5;
    var bounce         =  0.4;

    var maxLeftRight =  5;
    var maxJump      = 20;
    var maxFall      = 60;


    window.game = function(container) {
        function Player(element) {
            this.element  = element
            this.velocity = {top: 0, left: 0}
            this.position = {top: 0, left: 0}
            this.size     = {
                height: element.height(),
                width:  element.width()
            }
            this.changeDir = function(e) {changeDir(e, this)}
        }

        function CollisionObject(element, velocity) {
            if (typeof(velocity)=='undefined') velocity = {left:0, top:0}
            this.element  = element
            this.velocity = velocity
            this.position = {
                top:  element.offset().top,
                left: element.offset().left
            }
            this.size     = {
                height: element.height(),
                width:  element.width()
            }
        }

        function PickUpObject(element, velocity) {
            if (typeof(velocity)=='undefined') velocity = {left:0, top:0}
            this.element  = element
            this.velocity = velocity
            this.position = {
                top:  element.offset().top,
                left: element.offset().left
            }
            this.size     = {
                height: element.height(),
                width:  element.width()
            }
        }

        var player = new Player(container.find('.player'))
        var objects = []
        var pickup = []

        container.find('.collision').each(function() {
            objects.push(new CollisionObject($(this)))
        })

        container.find('.pickup').each(function() {
            objects.push(new PickUpObject($(this)))
        })

        var maxLeft   = container.offset().left;
        var maxRight  = maxLeft + container.width();
        var maxTop    = container.offset().top;
        var maxBottom = maxTop + container.height();
        var debug     = $('.debug')

        var lastIteration = new Date();

        function isInTheAir() {
            return Math.abs(player.velocity.top) > 5;
        }

        function collide(lastPosition) {
            for (var i in objects) {
                var obj = objects[i]

                if (overlaps(player, obj)) {
                    alert(overlaps(player, obj))
                }
                switch (overlaps(player, obj)) {
                    case false:
                        obj.element.css('background-color', 'black')
                        continue
                    case 'x':
                        player.velocity = {top:player.velocity.top,left:-player.velocity.left*bounce};
                        obj.element.css('background-color', 'red')
                        continue
                    case 'y':
                        player.velocity = {top:-player.velocity.top*bounce,left:player.velocity.left};
                        obj.element.css('background-color', 'red')
                        continue
                    case 'xy':
                        player.velocity = {top:-player.velocity.top*bounce,left:-player.velocity.left*bounce};
                        obj.element.css('background-color', 'red')
                        continue
                }
                player.position = lastPosition
            }
        }

        function pickUp() {
            for (var i in pickup) {
                var obj = pickup[i]
                if (!overlaps(player, obj)) {
                    obj.element.hide()
                    continue
                }
            }
        }

        function enforceBoundingBox() {
            var prev = {
                top: player.position.top,
                left: player.position.left
            }

            player.position.top  = Math.floor(Math.min(player.position.top, maxBottom - player.size.height));
            player.position.top  = Math.floor(Math.max(player.position.top, maxTop));
            player.position.left = Math.floor(Math.min(player.position.left, maxRight - player.size.width));
            player.position.left = Math.floor(Math.max(player.position.left, maxLeft));

            var retval = ''
                if (prev.top != player.position.top) {
                    retval = retval + 'x'
                }
            if (prev.left != player.position.left) {
                retval = retval + 'y'
            }

            return retval;
        }

        var overlaps = function(e1, e2) {
            var hw1 = Math.abs(e1.size.width / 2);
            var hw2 = Math.abs(e2.size.width / 2);
            var hh1 = Math.abs(e1.size.height / 2);
            var hh2 = Math.abs(e2.size.height / 2);
            var mh  = Math.abs(e1.position.top - e2.position.top)
            var mw  = Math.abs(e1.position.left - e2.position.left)

            if (hw1 + hw2 == mw && hh1 + hh2 > mh) {
                return 'x'
            }
            else if (hw1 + hw2 > mw && hh1 + hh2 == mh) {
                return 'y'
            }
            else if (hw1 + hw2 == mw && hh1 + hh2 == mh) {
                return 'xy'
            }

            return false
        }

        function enforceMaxSpeed() {
            if (isInTheAir()) {
                player.velocity.top = Math.max(player.velocity.top, -maxJump);
            }
            else {
                player.velocity.top = Math.min(player.velocity.top,  maxFall);
            }
            if (player.velocity.left < 0) {
                player.velocity.left = Math.max(player.velocity.left, -maxLeftRight);
            }
            else {
                player.velocity.left = Math.min(player.velocity.left, maxLeftRight);
            }
        }

        function changeDir(change, obj) {
            obj.velocity.top  += change.top
            obj.velocity.left += change.left
            enforceMaxSpeed()
        }

        function gravity() {
            player.changeDir({top: deltaFall, left:0});
        }

        function changePos() {
            var now = new Date();
            var deltaTime = now - lastIteration;
            lastIteration = now;
            var lastPosition = {top:player.position.top, left:player.position.left}

            player.position.top += player.velocity.top * deltaTime / 10;
            player.position.left += player.velocity.left * deltaTime / 10;

            collide(lastPosition)

            switch (enforceBoundingBox()) {
                case 'x':
                    player.velocity = {top:-bounce*player.velocity.top,left:player.velocity.left};
                    break
                case 'y':
                case 'xy':
                        player.velocity = {top:player.velocity.top,left:-player.velocity.left * bounce};
                        break
            }
            player.element.offset({top:player.position.top, left:player.position.left});
        }

        function iterate() {
            gravity();
            changePos();
        }

        function key(keycode) {
            var dir = null;
            switch(keycode.key) {
                case 'ArrowRight':
                case 'Right':
                    keycode.preventDefault();
                    if (!isInTheAir()) {
                        player.changeDir({top: 0, left: deltaLeftRight});
                    }
                    break;
                case 'ArrowLeft':
                case 'Left':
                    keycode.preventDefault();
                    if (!isInTheAir()) {
                        player.changeDir({top: 0, left: -deltaLeftRight});
                    }
                    break;
                case 'ArrowUp':
                case 'Up':
                    keycode.preventDefault();
                    if (!isInTheAir()) {
                        player.changeDir({top: -deltaJump, left: 0});
                    }
                    break;
                case 'ArrowDown':
                case 'Down':
                    keycode.preventDefault();
                    player.changeDir({top: deltaStomp, left: 0});
                    break;
                case 'd':
                    debug.html('top: ' + player.position.top + '<br>left: ' + player.position.left)
                    break;

                default:
            }
        }

        $(document).keypress(key);

        setInterval(iterate, 10);
    };


})(document, jQuery);
