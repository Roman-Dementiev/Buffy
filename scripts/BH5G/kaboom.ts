namespace BubbleShoot
{
	export type KaboomOptions = {
		gravity?: number,
		maxY?: number,
		callback?: Callback
	};

	export const kaboomDefaults: KaboomOptions = {
		gravity: 1.3,
		maxY: 800
	};

	interface Movable {
		left: number;
		top: number;
		setPosition(left: number, top: number);
	};

	type KaboomMove = {
		elm: Movable,
		dx: number,
		dy: number,
		x: number,
		y: number
	};

	export function kaboom(elm: Movable, opt?: KaboomOptions)
	{
		if (!opt) opt = {};
		let options: KaboomOptions = {
			gravity: opt.gravity ? opt.gravity : kaboomDefaults.gravity,
			maxY: opt.maxY ? opt.maxY : kaboomDefaults.maxY
		}

		let toMove = [{
			elm: elm,
			dx: Math.round(Math.random() * 10) - 5,
			dy: Math.round(Math.random() * 5) + 5,
			x: elm.left,
			y: elm.top
		}];


	//	setTimeout(() => moveAll(toMove, options), 40);
		let prevTime = Date.now();
		requestAnimationFrame(() => moveAll(toMove, prevTime, options));
	}

	function moveAll(toMove: KaboomMove[], prevTime: number, options: KaboomOptions)
	{
		let newTime = Date.now();
		let elapsed = newTime - prevTime;
		let frameProportion = elapsed / 25;

		let stillToMove: KaboomMove[] = [];
		for (let move of toMove) {
			move.x += move.dx * frameProportion;
			move.y -= move.dy * frameProportion;
			move.dy -= options.gravity * frameProportion;
			if (move.y < options.maxY) {
				move.elm.setPosition(Math.round(move.x), Math.round(move.y));
				stillToMove.push(move);
			} else if (options.callback) {
				options.callback();
			}
		};

		if (stillToMove.length > 0) {
			//setTimeout(() => moveAll(stillToMove, options), 40);
			requestAnimationFrame(() => moveAll(stillToMove, newTime, options));
		}
	};
}
