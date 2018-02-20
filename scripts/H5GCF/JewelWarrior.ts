namespace JewelWarrior
{
	export type Callback = (data?: any) => void;


	export type JewelType = number;
	export type JewelLayout  = JewelType[][];
	export const kNoJewel = -1;

	export type GameConfig = {
		numRows: number,
		numCols: number,
		numJewelTypes: number,
		chainLength: number,
		baseScore: number,
		baseLevelTimer: number,
		baseLevelScore: number,
		baseLevelExp: number,
		layout?: string | JewelLayout,
		generator?: ILayoutGenerator
	};

	export const kDefaultGameConfig = {
		numRows: 8,
		numCols: 8,
		numJewelTypes: 7,
		chainLength: 3,
		baseScore: 100,
		baseLevelTimer: 60000,
		baseLevelScore: 1500,
		baseLevelExp: 1.05,
//		layout: 'random'
//		generator: 'random'
	};

	export enum BoardEventType {
		Move,
		Remove,
		Refill,
		Score,
		BadSwap
	};

	export type BoardEvent =  {
		type: BoardEventType,
		data: any
	};

	export type RemoveEventItem = {
		x: number,
		y: number,
		type: JewelType

	};
	export type MoveEventItem = {
		toX: number,
		toY: number,
		fromX: number,
		fromY: number,
		type: JewelType
	
	};

//	export type BoardCallback = (events?: BoardEvent[]) => void;

	export interface IBoard
	{
		readonly numCols: number;
		readonly numRows: number;

		getLayout(): JewelLayout;
		setLayout(layout: JewelLayout): void;

		getJewelAt(col: number, row: number): JewelType;
		putJewelAt(col: number, row: number, jewel: JewelType);

		print();
	};

	export interface IBoardSecvice
	{
		readonly board: IBoard;

		initialize(startJewels: JewelLayout, callback: Callback): void
		swap(col1: number, row1: number, col2: number, row2: number, callback?: Callback);
//		getLayout(): JewelLayout;
	};


	export interface IBoardRenderer
	{
		initialize(boardElement: Element, callback: Callback);

		start(board: IBoard);
		pause();
		resume(pauseTime: number);

		redrawBoard(callback?: Callback);
		setCursor(col: number, row: number, selected: boolean)
		unsetCursor();

		moveJewels(moved: MoveEventItem[], callback?: Callback);
		removeJewels(removed: RemoveEventItem[], callback?: Callback);

		levelUpAnimation(callback?: Callback);
		gameOverAnimation(callback?: Callback);
	};


	export type GameState = {
		level: number,
		score: number,
		timer: number, // setTimeout reference
		startTime: number, // time at start of level
		endTime: number // time to game over
	};

	export type GameData = {
		level: number,
		score: number,
		time: number,
		endTime: number,
		jewels: JewelLayout
	};


	export interface IGameScreen
	{
		updateGameInfo(state: GameState);
		updateProgress(percent: number);
		announce(str: string);
	};

	export type Cursor = {
		col: number,
		row: number,
		selected: boolean
	};

	// Worker interface
	export type SwapArgs = {
		x1: number,
		y1: number,
		x2: number,
		y2: number
	};

	export const cmdCreate = "create"; // data: GameConfig
	export const cmdInitialize = "initialize"; // data: JewelLayout|null
	export const cmdSwap = "swap"; // data: SwapArgs


	export type Factory = {
		createBoard: (config: GameConfig) => IBoard,
		createService: (config: GameConfig) => IBoardSecvice,
		createRenderer: (config: GameConfig) => IBoardRenderer
	};

	export var factory: Factory = {
		createBoard: null,
		createService: null,
		createRenderer: null
	};

	// Game Actions
	export const ActionSelectJewel = "selectJewel";
	export const ActionMoveUp = "moveUp";
	export const ActionMoveDown = "moveDown";
	export const ActionMoveLeft = "moveLeft";
	export const ActionMoveRight = "moveRight";


	export type HighScore = {
		name: string,
		score: number
	};
	export const kMaxHighScores = 10;

	//Uyility
	export function isValidLayout(layout: number[][], numCols: number, numRows: number): boolean
	{
		if (!layout)
			return false;

		if (!Dwag.checkArrayLength(layout, numCols))
			return false;

		for (let col = 0; col < numCols; col++) {
			if (!Dwag.checkArrayLength(layout[col], numRows))
				return false;
		}
		return true;
	}

	export function checkLayout(layout: number[][], numCols: number, numRows: number): void
	{
		if(!isValidLayout(layout, numCols, numRows)) {
			throw new Error("Invalid board layout");
		}
	}

	export function layoutToString(layout: number[][], numCols: number, numRows: number, multiline = true) : string
	{
		let str = "";
		for (let row = 0; row < numRows; row++) {
			for (let col = 0; col < numCols; col++) {
				let val = null;
				if (layout[col] && typeof layout[col][row] === 'number') {
					str += layout[col][row] + " ";
				} else {
					str += "# ";
				}
			}
			if (multiline)
				str += "\r\n";
		}
		return str;
	}

	export function printLayout(layout: number[][], numCols: number, numRows: number, prefix?: string, suffix?: string)
	{
		if (prefix) {
			console.log(prefix);
		}

		console.log(layoutToString(layout, numCols, numRows));

		if (suffix) {
			console.log(suffix);
		}
	}
};
