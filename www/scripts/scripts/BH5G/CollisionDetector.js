var BubbleShoot;
(function (BubbleShoot) {
    ;
    function dist(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    }
    var CollisionDetector = (function () {
        function CollisionDetector() {
        }
        CollisionDetector.findIntersection = function (curBubble, board, angle) {
            var collision = null;
            var start = {
                x: curBubble.sprite.left + BubbleShoot.BUBBLE_DIMS / 2,
                y: curBubble.sprite.top + BubbleShoot.BUBBLE_DIMS / 2
            };
            var dx = Math.sin(angle);
            var dy = -Math.cos(angle);
            for (var i = 0; i < board.numRows; i++) {
                var row = board.getRow(i);
                for (var j = 0; j < row.length; j++) {
                    var bubble = row[j];
                    if (bubble) {
                        var coords = bubble.getCoords();
                        var distToBubble = {
                            x: start.x - coords.x,
                            y: start.y - coords.y
                        };
                        var t = dx * distToBubble.x + dy * distToBubble.y;
                        var ex = -t * dx + start.x;
                        var ey = -t * dy + start.y;
                        var distEC = dist(ex - coords.x, ey - coords.y);
                        if (distEC < CollisionDetector.collisionDistance) {
                            var dt = Math.sqrt(BubbleShoot.BUBBLE_DIMS * BubbleShoot.BUBBLE_DIMS - distEC * distEC);
                            var offset1 = {
                                x: (t - dt) * dx,
                                y: -(t - dt) * dy
                            };
                            var offset2 = {
                                x: (t + dt) * dx,
                                y: -(t + dt) * dy
                            };
                            var distToCollision = void 0, dest = void 0;
                            var distToCollision1 = dist(offset1.x, offset1.y);
                            var distToCollision2 = dist(offset2.x, offset2.y);
                            if (distToCollision1 < distToCollision2) {
                                distToCollision = distToCollision1;
                                dest = {
                                    x: offset1.x + start.x,
                                    y: offset1.y + start.y
                                };
                            }
                            else {
                                distToCollision = distToCollision2;
                                dest = {
                                    x: -offset2.x + start.x,
                                    y: offset2.y + start.y
                                };
                            }
                            if (!collision || collision.distToCollision > distToCollision) {
                                collision = {
                                    bubble: bubble,
                                    distToCollision: distToCollision,
                                    coords: dest
                                };
                            }
                            ;
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            ;
            return collision;
        };
        return CollisionDetector;
    }());
    CollisionDetector.collisionFactor = 0.75; // 0.88
    CollisionDetector.collisionDistance = BubbleShoot.BUBBLE_DIMS * CollisionDetector.collisionFactor;
    BubbleShoot.CollisionDetector = CollisionDetector;
    ;
})(BubbleShoot || (BubbleShoot = {}));
;
//# sourceMappingURL=CollisionDetector.js.map