namespace BubbleShoot
{
	export const POP_SOUND = "pop.mp3";
	export const BUBBLE_SPRITE_SHEET = "bubble_sprite_sheet.png";
	export const SPRITE_IMAGE_DIM = 50;
	export const NUM_BUBBLE_TYPES = 4;
	export const NUM_POP_PHASES = 4;

	export const BUBBLE_DIMS = 44;
	export const BUBBLE_HALF = BUBBLE_DIMS / 2;
	export const ROW_HEIGHT = 40;
	export const BOARD_LEFT = 120;
	export const CURRENT_BUBBLE_TOP = 470;

	export const MAX_BUBBLES = 70;
	export const POINTS_PER_BUBBLE = 50;
	export const MAX_ROWS = 11;


	export type Callback = () => void;

	export function bootstrap(useCanvas?: boolean) : void
	{
		if (typeof useCanvas === 'undefined') {
			let doc: any = $(document)[0];
			let url: any = doc.location;
			let args: string = url.search;
			if (args === '?nocanvas') {
				useCanvas = false;
			} else {
				useCanvas = true;
			}
		}

		$(document).ready(() =>
		{
			UI.init();
			Factory.init(useCanvas);

			Bubble.loadSpreadSheet(() => {
				Game.init();
			})
		});
	}
};

