namespace BubbleShoot
{
	export interface Sprite
	{

		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
		setPosition(left: number, top: number): void

		/* Animations */
		moveTo(left: number, top: number, duration: number, easing?: string, complete?: Function): void;
		kaboom(opt?: KaboomOptions): void;

		updateFrame: Callback;

		appendTo(ui: UIElement);
		remove();
	};

	export class DomSprite implements Sprite
	{
		protected el: JQuery;
		public updateFrame: Callback = null;

		public constructor(selector?: string, tag: string = 'div')
		{
			if (selector) {
				this.el = $(selector);
			} else {
				this.el = $(document.createElement(tag));
			}
		}

		public addClass(className: string): void
		{
			this.el.addClass(className);
		}

		public get $(): JQuery { return this.el; }
		public get left(): number { return this.el.position().left; }
		public get top(): number { return this.el.position().top; }
		public get width(): number { return this.el.width(); }
		public get height(): number { return this.el.height(); }
//		public get position(): JQueryCoordinates { return this.el.position(); }
		public setPosition(left: number, top: number): void
		{
			this.el.css({
				left: left,
				top: top
			});
		}

		public getProperty(propertyName: string): string {
			return this.el.css(propertyName);
		}
		public setProperty(propertyName: string, value: string|number): void
		{
			this.el.css(propertyName, value);
		}
		public css(properties: JQueryCssProperties) {
			this.el.css(properties);
		}


		public appendTo(ui: UIElement)
		{
			this.el.appendTo(ui);
		}

		public remove()
		{
			this.el.remove();
		}


		//public animate(properties: Object, options: JQueryAnimationOptions)
		//{
		//	this.el.animate(properties, options);
		//}

		public moveTo(left: number, top: number, duration: number, easing?: string, complete?: Function): void
		{
			this.el.animate({
				left: left,
				top: top
			}, duration, easing, complete);
		}

		public kaboom(opt?: KaboomOptions): void
		{
			kaboom(this, opt);
		}
	};

	export class CanvasSprite implements Sprite
	{
		public left: number = 0;
		public top: number = 0;
		public readonly width: number = BUBBLE_DIMS;
		public readonly height: number = BUBBLE_DIMS;

		private _updateFrame: Callback = null;
		public get updateFrame(): Callback { return this._updateFrame; }

		public setPosition(left: number, top: number): void
		{
			this.left = left;
			this.top = top;
		}

		public appendTo(ui: UIElement) { }
		public remove(delay?: number) { }

		public moveTo(left: number, top: number, duration: number, easing?: string, complete?: Function): void
		{
			let animationStart = Date.now();
			let startLeft = this.left;
			let startTop = this.top;
			let that = this;
			this._updateFrame = () => {
				let elapsed = Date.now() - animationStart;
				let proportion = elapsed / duration;
				if (proportion > 1)
					proportion = 1;
				that.setPosition(
					startLeft + (left - startLeft) * proportion,
					startTop + (top - startTop) * proportion
				);
			};
			setTimeout(() => {
				that._updateFrame = null;
				if (complete) {
					complete();
				}
			}, duration);
		}

		public kaboom(opt?: KaboomOptions): void
		{
			kaboom(this, opt);
		}
	};
};

