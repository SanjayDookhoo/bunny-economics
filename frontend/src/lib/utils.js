export const getRandomFloatInclusive = (start, end) => {
	return Math.random() * (end - start) + start;
};

export const globals = {
	inMaxFreeFallSpeed: false,
	collidedThereforeGameStarted: false,
};
