export const bunnyPosition = $state({ x: undefined, y: 0 });
export const bunnyGoalPosition = $state({ x: undefined, y: 0 });
export const cameraPanning = $state({ y: 0 });
export const menu = $state({ show: 1 });
export const gameWindowDimensions = $state({
	width: 0,
	height: 0,
	minXAxisValue: 0,
	maxXAxisValue: 0,
	minYAxisValue: 0,
	maxYAxisValue: 0,
});
export const general = $state({
	volume: 0,
	score: 0,
	previousScore: 0,
});
