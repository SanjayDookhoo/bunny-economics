<script>
	import { onMount } from 'svelte';

	const INTERNAL_PADDING = 30; // px
	const X_AXIS_MAX_DELTA = 15; // px
	const Y_AXIS_MAX_DELTA = 15; // px
	const USER_HITBOX_WIDTH = 64; // px
	const USER_HITBOX_HEIGHT = 64; // px
	const BELL_HITBOX_WIDTH = 64; // px
	const BELL_HITBOX_HEIGHT = 64; // px
	const BELLS_MAX_COUNT = 30;
	const Y_VARIANCE_AMOUNT = 20; // px
	const Y_BETWEEN_BELLS_BASE_HEIGHT = 150; // px
	const BELLS_AUTO_FALL_SPEED_PER_SEC = 30;
	const Y_JUMP = 300; // px

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;
	let xAxisMouseIntervalId;
	let yAxisIntervalId;
	let wasAtPositionY;
	let collidedThereforeGameStarted = 0;
	let gameNotStarterRemoveGroundLevelBellsIntervalId;

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
	let bellsArr = $state([]);
	let latestBellId = $state(-1);
	let scrollingBellsStartingYPositionPX = $state(250); // px
	let gameWindowRef = $state();

	const getRandomIntInclusive = (start, end) => {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const createNewBell = (bellIndex) => {
		const { YPositionPX = 0 } = bellsArr[latestBellId % BELLS_MAX_COUNT] ?? {};
		const YVariance = getRandomIntInclusive(0, Y_VARIANCE_AMOUNT);
		latestBellId++;
		const currentBellId = latestBellId;
		const intervalId = setInterval(() => {
			checkIfCollideWithBell(currentBellId);
		}, 50);
		bellsArr[bellIndex] = {
			bellId: latestBellId,
			intervalId,
			YPositionPX: YPositionPX + Y_BETWEEN_BELLS_BASE_HEIGHT + YVariance,
			XPositionPX: getRandomIntInclusive(
				gameWindowDimensions.minXAxisValue,
				gameWindowDimensions.maxXAxisValue - USER_HITBOX_WIDTH
			),
		};
	};

	// initiate bells
	onMount(() => {
		setTimeout(() => {
			for (let i = 0; i < BELLS_MAX_COUNT; i++) {
				createNewBell(i);
			}
		}, 1000);
	});

	// bells scroll
	onMount(() => {
		let raf,
			prev = performance.now();

		const tick = (now) => {
			const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000)); // seconds
			prev = now;

			scrollingBellsStartingYPositionPX -= BELLS_AUTO_FALL_SPEED_PER_SEC * dt;

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	$inspect(bellsArr);

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

			// if current is out of bounds
			if (userPositionY < minY) {
				userPositionY = goalPositionY = minY;
			} else if (userPositionY > maxY) {
				userPositionY = goalPositionY = maxY;
			} else {
				if (Math.abs(goalPositionY - userPositionY) < 1) {
					// snap when extremely close to avoid a long tiny tail
					// userPositionY = goalPositionY;
					goalPositionY = 0; // simulate falling
				} else {
					if (goalPositionY > userPositionY) {
						const a = 1 - Math.exp(-dt / TAU_Y);
						//console.log(a);
						const delta = (goalPositionY - userPositionY) * a;
						// console.log(delta);
						if (delta >= 0.2) {
							userPositionY += delta;
						} else {
							wasAtPositionY = goalPositionY + 2;
							goalPositionY = 0; // simulate falling
						}
					} else {
						const a = 1 - Math.exp(-dt / TAU_Y);
						// console.log(a);
						const delta = (wasAtPositionY - userPositionY) * a * -1;
						userPositionY += delta;
					}
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
			if (userPositionY != INTERNAL_PADDING) return; // 0 + INTERNAL_PADDING
			if (collidedThereforeGameStarted) return;
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

	const checkIfCollideWithBell = (bellId) => {
		const bell = document.getElementById(`bell-${bellId}`);
		const user = document.getElementById('user');
		if (!bell || !user) return;

		var rect1 = bell.getBoundingClientRect();
		var rect2 = user.getBoundingClientRect();

		// if collides
		if (
			!(
				rect1.top > rect2.bottom ||
				rect1.right < rect2.left ||
				rect1.bottom < rect2.top ||
				rect1.left > rect2.right
			)
		) {
			handleCollide(bellId);
		}
	};

	const handleCollide = (bellId) => {
		if (!collidedThereforeGameStarted) {
			collidedThereforeGameStarted = 1;
		}
		const bellIndex = bellId % BELLS_MAX_COUNT;
		clearInterval(bellsArr[bellIndex].intervalId);
		createNewBell(bellIndex);
		goalPositionY += Y_JUMP;
	};

	onMount(() => {
		gameNotStarterRemoveGroundLevelBellsIntervalId = setInterval(() => {
			if (collidedThereforeGameStarted) {
				clearInterval(gameNotStarterRemoveGroundLevelBellsIntervalId);
			} else {
				let minIndex = -1;
				let minValue = Infinity;
				for (let i = 0; i < bellsArr.length; i++) {
					if (bellsArr[i].YPositionPX < minValue) {
						minValue = bellsArr[i].YPositionPX;
						minIndex = i;
					}
				}
				if (minIndex != -1) {
					const lowestYPositionPX = bellsArr[minIndex].YPositionPX;

					if (scrollingBellsStartingYPositionPX + lowestYPositionPX < 200) {
						createNewBell(minIndex);
					}
				}
			}
		}, 50);
	});
</script>

<div class="w-screen h-screen p-4">
	<div
		bind:this={gameWindowRef}
		class="relative border border-gray-300 rounded-lg h-full w-full overflow-hidden"
	>
		<div
			id="user"
			class="absolute rounded-full bg-gray-500"
			style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: {userPositionY}px; left:{userPositionX}px"
		></div>

		{#each bellsArr as bell}
			<div
				id="bell-{bell.bellId}"
				class="absolute bg-blue-500"
				style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: {scrollingBellsStartingYPositionPX +
					bell.YPositionPX}px; left:{bell.XPositionPX}px"
			></div>
		{/each}
	</div>
</div>
