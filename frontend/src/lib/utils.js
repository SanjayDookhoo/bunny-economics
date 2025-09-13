export const getRandomFloatInclusive = (start, end) => {
	return Math.random() * (end - start) + start;
};

export const getRandomIntInclusive = (start, end) => {
	return Math.floor(Math.random() * (end - start + 1)) + start;
};

export const globals = {
	inMaxFreeFallSpeed: false,
	collidedThereforeGameStarted: false,
};
