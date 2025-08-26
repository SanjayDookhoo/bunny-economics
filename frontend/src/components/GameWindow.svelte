<script>
	import { onMount } from 'svelte';

	const INTERNAL_PADDING = 30; // px
	const X_AXIS_MAX_DELTA = 15; // px
	const USER_HITBOX_WIDTH = 64; // px
	const USER_HITBOX_HEIGHT = 64; // px

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;
	let xAxisMouseIntervalId;

	let mousePositionX = $state(undefined);
	let userPositionX = $state(undefined);
	let userPositionY = $state(0);
	let userFacingDirection = $state('right');
	let gameWindowDimensions = $state({
		width: 0,
		height: 0,
		minXAxisValue: 0,
		maxXAxisValue: 0,
		minYAxisValue: 0,
		maxYAxisValue: 0,
	});
	let gameWindowRef = $state();

	// check on interval
	// onmount here used to prevent hot reloading from stacking multiple intervals
	onMount(() => {
		xAxisMouseIntervalId = setInterval(() => {
			if (userPositionX === undefined || mousePositionX == undefined) return;

			if (userPositionX < gameWindowDimensions.minXAxisValue) {
				mousePositionX = userPositionX = gameWindowDimensions.minXAxisValue;
			} else if (
				userPositionX >
				gameWindowDimensions.maxXAxisValue - USER_HITBOX_WIDTH
			) {
				mousePositionX = userPositionX =
					gameWindowDimensions.maxXAxisValue - USER_HITBOX_WIDTH;
			} else {
				if (Math.abs(mousePositionX - userPositionX) <= X_AXIS_MAX_DELTA) {
					userPositionX = mousePositionX; // close enough, snap to target
				} else {
					if (mousePositionX < userPositionX) {
						userPositionX -= X_AXIS_MAX_DELTA;
					} else if (mousePositionX > userPositionX) {
						userPositionX += X_AXIS_MAX_DELTA;
					}
				}
			}
		}, 16);

		return () => clearInterval(xAxisMouseIntervalId);
	});

	// handle horizontal mouse move
	onMount(() => {
		if (!gameWindowRef) return;

		const handleMouseMove = (e) => {
			const rect = gameWindowRef.getBoundingClientRect();
			// X position relative to the element
			const mousePositionXTemp = e.clientX - rect.left - USER_HITBOX_WIDTH / 2;
			if (
				mousePositionXTemp >= gameWindowDimensions.minXAxisValue &&
				mousePositionXTemp <=
					gameWindowDimensions.maxXAxisValue - USER_HITBOX_WIDTH
			) {
				mousePositionX = mousePositionXTemp;
			}
		};

		gameWindowRef.addEventListener('mousemove', handleMouseMove);

		return () => {
			gameWindowRef.removeEventListener('mousemove', handleMouseMove);
		};
	});

	// gameWindowDimensions
	onMount(() => {
		if (!gameWindowRef) return;

		// initialize userPositionX to the center
		userPositionX =
			gameWindowRef.getBoundingClientRect().width / 2 - USER_HITBOX_WIDTH / 2;

		const updateDimensions = () => {
			const rect = gameWindowRef.getBoundingClientRect();
			gameWindowDimensions = {
				width: rect.width,
				height: rect.height,
				minXAxisValue: INTERNAL_PADDING,
				maxXAxisValue: rect.width - INTERNAL_PADDING,
				minYAxisValue: INTERNAL_PADDING,
				maxYAxisValue: rect.height - INTERNAL_PADDING,
			};
		};

		const resizeObserver = new ResizeObserver(() => {
			updateDimensions();
		});

		resizeObserver.observe(gameWindowRef);
		updateDimensions();

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div class="w-screen h-screen p-4">
	<div
		bind:this={gameWindowRef}
		class="border border-gray-300 rounded-lg h-full w-full relative"
	>
		<div
			class="absolute rounded-full bg-gray-500"
			style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: 0; left:{userPositionX}px"
		></div>
	</div>
</div>
