<script>
	import { onMount } from 'svelte';

	const INTERNAL_PADDING = 30; // px
	const X_AXIS_MAX_DELTA = 15; // px
	const Y_AXIS_MAX_DELTA = 15; // px
	const USER_HITBOX_WIDTH = 64; // px
	const USER_HITBOX_HEIGHT = 64; // px

	const Y_JUMP = 200; // px

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;
	let xAxisMouseIntervalId;
	let yAxisIntervalId;

	let goalPositionY = $state(0);
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
		const X_SPEED_PX_PER_SEC = X_AXIS_MAX_DELTA * 60;
		let raf;
		let prev = performance.now();

		const tick = (now) => {
			const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000)); // seconds
			prev = now;

			if (userPositionX !== undefined && mousePositionX !== undefined) {
				const minX = gameWindowDimensions.minXAxisValue;
				const maxX = gameWindowDimensions.maxXAxisValue - USER_HITBOX_WIDTH;

				// clamp goal to bounds
				mousePositionX = Math.max(minX, Math.min(maxX, mousePositionX));

				if (userPositionX < minX) {
					userPositionX = mousePositionX = minX;
				} else if (userPositionX > maxX) {
					userPositionX = mousePositionX = maxX;
				} else {
					const dx = mousePositionX - userPositionX;
					const step = X_SPEED_PX_PER_SEC * dt;

					if (Math.abs(dx) <= step) {
						userPositionX = mousePositionX; // snap when close
					} else {
						userPositionX += Math.sign(dx) * step;
					}
				}
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// check on interval
	// onmount here used to prevent hot reloading from stacking multiple intervals
	onMount(() => {
		const TAU_Y = 0.12; // smaller = snappier, larger = floatier
		let raf;
		let prev = performance.now();

		const tick = (now) => {
			const dt = Math.min(0.1, (now - prev) / 1000); // seconds, clamp big pauses
			prev = now;

			if (userPositionY === undefined || goalPositionY === undefined) {
				raf = requestAnimationFrame(tick);
				return;
			}

			const minY = gameWindowDimensions.minYAxisValue;
			const maxY = gameWindowDimensions.maxYAxisValue - USER_HITBOX_WIDTH;

			// keep target inside bounds
			goalPositionY = Math.max(minY, Math.min(maxY, goalPositionY));

			// if current is out of bounds, snap (preserves your original behavior)
			if (userPositionY < minY) {
				userPositionY = goalPositionY = minY;
			} else if (userPositionY > maxY) {
				userPositionY = goalPositionY = maxY;
			} else {
				// exponential smoothing ease-out toward goal
				const a = 1 - Math.exp(-dt / TAU_Y);
				userPositionY += (goalPositionY - userPositionY) * a;

				// snap when extremely close to avoid a long tiny tail
				if (Math.abs(goalPositionY - userPositionY) < 0.001) {
					userPositionY = goalPositionY;
				}
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
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

	// mouse click to jump
	onMount(() => {
		if (!gameWindowRef) return;

		const handleClick = (e) => {
			if (e.button !== 0) return; // only allow left click
			goalPositionY += Y_JUMP;
		};

		gameWindowRef.addEventListener('click', handleClick);

		return () => {
			gameWindowRef.removeEventListener('click', handleClick);
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
			style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: {userPositionY}px; left:{userPositionX}px"
		></div>
	</div>
</div>
