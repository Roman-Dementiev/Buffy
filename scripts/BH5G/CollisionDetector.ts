namespace BubbleShoot
{
	export interface Collision
	{
		bubble: Bubble,
		coords: Coords,
		distToCollision: number
	};

	function dist(dx: number, dy: number) : number
	{
		return Math.sqrt(dx * dx + dy * dy);
	}

	export class CollisionDetector
	{
		static readonly collisionFactor = 0.75; // 0.88
		static readonly collisionDistance = BUBBLE_DIMS * CollisionDetector.collisionFactor;

		public static findIntersection(curBubble: Bubble, board: Board, angle: number) : Collision
		{
			let collision: Collision = null;
			let start = {
				x: curBubble.sprite.left + BUBBLE_DIMS / 2,
				y: curBubble.sprite.top + BUBBLE_DIMS / 2
			};
			let dx = Math.sin(angle);
			let dy = -Math.cos(angle);
			for (let i = 0; i < board.numRows; i++) {
				let row = board.getRow(i);
				for (let j = 0; j < row.length; j++) {
					var bubble = row[j];
					if (bubble) {
						let coords = bubble.getCoords();
						let distToBubble = {
							x: start.x - coords.x,
							y: start.y - coords.y
						};
						let t = dx * distToBubble.x + dy * distToBubble.y;
						let ex = -t * dx + start.x;
						let ey = -t * dy + start.y;
						let distEC = dist(ex - coords.x, ey - coords.y);
						if (distEC < CollisionDetector.collisionDistance) {
							let dt = Math.sqrt(BUBBLE_DIMS * BUBBLE_DIMS - distEC * distEC);
							let offset1 = {
								x: (t - dt) * dx,
								y: -(t - dt) * dy
							};
							let offset2 = {
								x: (t + dt) * dx,
								y: -(t + dt) * dy
							};
							let distToCollision: number, dest: Coords;
							let distToCollision1 = dist(offset1.x, offset1.y);
							let distToCollision2 = dist(offset2.x, offset2.y);
							if (distToCollision1 < distToCollision2) {
								distToCollision = distToCollision1;
								dest = {
									x: offset1.x + start.x,
									y: offset1.y + start.y
								};
							} else {
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
							};
						};
					};
				};
			};
			return collision;
		}
	};
};

