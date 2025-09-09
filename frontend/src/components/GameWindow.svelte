<script>
	import { onDestroy, onMount } from 'svelte';
	import Starburst from './Starburst.svelte';
	import forest from '../assets/forest.png';
	import bellImg from '../assets/bell.png';
	import Menu from './Menu.svelte';

	let { scale } = $props();

	const X_AXIS_MAX_DELTA = 15; // px
	const Y_AXIS_MAX_DELTA = 15; // px
	const USER_HITBOX_WIDTH = 64; // px
	const USER_HITBOX_HEIGHT = 64; // px
	const BELL_HITBOX_WIDTH = 64; // px
	const BELL_HITBOX_HEIGHT = 64; // px
	const BELLS_MAX_COUNT = 14;
	const Y_VARIANCE_AMOUNT = 20; // px
	const Y_BETWEEN_BELLS_BASE_HEIGHT = 150; // px
	const BELLS_AUTO_FALL_SPEED_PER_SEC = 30;
	const Y_JUMP = 370; // px
	const MAX_FREE_FALL_SPEED = -35;
	const HORIZONTAL_INTERACTIVE_PADDING = 40; // px
	const STARBURST_HEIGHT_RANGE = 50; // px
	const STARBURST_COUNT_PER_RANGE = 3; // px
	const DESPAWN_BELLS_BELOW_CURRENT_USER_LOCATION_BELLS = 6;
	const DESPAWN_STARBURST_OUT_OF_YPX_RANGE = 800;
	const DESPAWN_BELL_APPROACHING_GROUND_AT_PX = 300;
	const STARBURST_BASE_HEIGHT_AND_WIDTH = 15; // px
	const STARBURST_BASE_OPACITY = 15;
	const STARBURST_ID_START = 5;
	const FIRST_BELL_Y_POSITION_PX = 200;
	// defined for an easy initializing of state
	const createInitialArr = () => {
		const arr = [];
		for (let index = 0; index < BELLS_MAX_COUNT; index++) {
			arr.push({
				bellId: crypto.randomUUID(),
				YPositionPX: 0,
				XPositionPX: 0,
				hidden: true,
			});
		}
		return arr;
	};

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;
	let xAxisMouseIntervalId;
	let yAxisIntervalId;
	let wasAtPositionY;
	let collidedThereforeGameStarted = 0;
	let latestBellId = 1;
	let latestStarburstId = STARBURST_ID_START;
	let latestBellYPositionPX = 0;
	let inMaxFreeFallSpeed = 0;
	let userInteracted = false;
	let bellsArrIntervalIdMap = new Map(); // uses the bellsArr index to map to the related intervalId for the collision check interval, ensures that this can be cleared on hot reloading in svelte without triggering a $effect cyclic loop because of trying to read and write to the array simultaneously

	let goalPositionY = $state(0);
	let mousePositionX = $state(undefined);
	let userPositionX = $state(undefined);
	let userPositionY = $state(0);
	let cameraPanningY = $state(0);
	let cameraGoalY = $state(0);
	let userFacingDirection = $state('right');
	let gameWindowDimensions = $state({
		width: 0,
		height: 0,
		minXAxisValue: 0,
		maxXAxisValue: 0,
		minYAxisValue: 0,
		maxYAxisValue: 0,
	});

	let bellsArr = $state(createInitialArr());
	let starburstsArr = $state([]);
	let scrollingBellsStartingYPositionPX = $state(250); // px
	let gameWindowRef = $state();
	let volume = $state(0.5);
	let showMenu = $state(true);

	let gainNode = $state(null);

	const updateCamera = (dt, userPositionY) => {
		const tau = inMaxFreeFallSpeed ? 0 : 0.15; // smoothing: smaller = snappier, when in freefall make the camera snap faster, so the user doesnt go out of bounds because the camera cant keep up with the user falling
		const deadMin =
			(userPositionY > 250 ? 0.2 : 0) * gameWindowDimensions.height; // 20% from bottom, the userPositionY check ensures that when the game starts, the user remains planted on the ground, instead of the camera going lower than ground attempting to keep the user at the 20%  point
		const deadMax = 0.4 * gameWindowDimensions.height; // 40% from bottom

		// Where is the player on screen (from bottom)?
		const playerScreenY = userPositionY - cameraPanningY;

		// Desired camera y (only change if player left the band)
		let cameraGoalY = cameraPanningY;
		if (playerScreenY < deadMin) {
			cameraGoalY = userPositionY - deadMin; // push camera down
		} else if (playerScreenY > deadMax) {
			cameraGoalY = userPositionY - deadMax; // push camera up
		}

		// Smooth move: exponential smoothing toward desired
		const a = 1 - Math.exp(-dt / tau);
		cameraPanningY += (cameraGoalY - cameraPanningY) * a;
	};

	onMount(() => {
		let raf,
			prev = performance.now();
		function frame(now) {
			const dt = Math.min(0.1, (now - prev) / 1000);
			prev = now;

			updateCamera(dt, userPositionY);

			requestAnimationFrame(frame);
		}
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	});

	const getRandomFloatInclusive = (start, end) => {
		return Math.random() * (end - start) + start;
	};

	const createNewBell = (index) => {
		const YVariance = getRandomFloatInclusive(0, Y_VARIANCE_AMOUNT);
		latestBellId++;
		const currentBellId = latestBellId;
		const intervalId = setInterval(() => {
			checkIfCollideWithBell(currentBellId);
		}, 10);
		const YPositionPX =
			latestBellYPositionPX + Y_BETWEEN_BELLS_BASE_HEIGHT + YVariance;
		const bell = {
			bellId: latestBellId,
			YPositionPX,
			XPositionPX: getRandomFloatInclusive(
				gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
				gameWindowDimensions.maxXAxisValue -
					USER_HITBOX_WIDTH -
					HORIZONTAL_INTERACTIVE_PADDING
			),
			hidden: false, // will allow hiding by css originally, so there isnt a flicker of bells being removed from dom
		};

		const prevIntervalId = bellsArrIntervalIdMap.get(index);
		clearInterval(prevIntervalId);

		bellsArrIntervalIdMap.set(index, intervalId);
		bellsArr[index] = bell;
		latestBellYPositionPX = YPositionPX;
	};

	// ensures on hot reload the intervals for collision check are cleared
	onDestroy(() => {
		for (const intervalId of bellsArrIntervalIdMap.values()) {
			clearInterval(intervalId);
		}
	});

	$effect(() => {
		if (!showMenu) {
			latestBellYPositionPX = FIRST_BELL_Y_POSITION_PX;
			scrollingBellsStartingYPositionPX = 0;
			for (let index = 0; index < BELLS_MAX_COUNT; index++) {
				createNewBell(index);
			}
		}
	});

	const createNewStarburst = ({ index: starburstIndex, isAscending }) => {
		let starburst;
		const YVariance = getRandomFloatInclusive(0, Y_VARIANCE_AMOUNT);
		if (isAscending) {
			latestStarburstId++;
			starburst = {
				starburstId: crypto.randomUUID(),
				YPositionPX: getRandomFloatInclusive(
					latestStarburstId * STARBURST_HEIGHT_RANGE,
					latestStarburstId * (STARBURST_HEIGHT_RANGE + 1)
				),
				XPositionPX: getRandomFloatInclusive(
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
					gameWindowDimensions.maxXAxisValue -
						USER_HITBOX_WIDTH -
						HORIZONTAL_INTERACTIVE_PADDING
				),
				multiplier: getRandomFloatInclusive(1, 2),
			};
		} else {
			latestStarburstId--;
			starburst = {
				starburstId: crypto.randomUUID(),
				YPositionPX: getRandomFloatInclusive(
					(latestStarburstId - BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE) *
						STARBURST_HEIGHT_RANGE,
					(latestStarburstId - BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE) *
						(STARBURST_HEIGHT_RANGE + 1)
				),
				XPositionPX: getRandomFloatInclusive(
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
					gameWindowDimensions.maxXAxisValue -
						USER_HITBOX_WIDTH -
						HORIZONTAL_INTERACTIVE_PADDING
				),
				multiplier: getRandomFloatInclusive(1, 2),
			};
		}

		if (starburstsArr[starburstIndex]) {
			starburstsArr[starburstIndex] = starburst;
		} else {
			starburstsArr.push(starburst);
		}
	};

	// initiate starburst
	onMount(() => {
		setTimeout(() => {
			for (
				let index = 0;
				index < BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE;
				index++
			) {
				createNewStarburst({ index, isAscending: true });
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

	// $inspect(bellsArr);

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
				const minX =
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING;
				const maxX =
					gameWindowDimensions.maxXAxisValue -
					USER_HITBOX_WIDTH -
					HORIZONTAL_INTERACTIVE_PADDING;

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

			if (Math.abs(goalPositionY - userPositionY) < 1) {
				// snap when extremely close to avoid a long tiny tail
				// userPositionY = goalPositionY;
				goalPositionY = 0; // simulate falling
			} else {
				if (goalPositionY > userPositionY) {
					const a = 1 - Math.exp(-dt / TAU_Y);
					const delta = (goalPositionY - userPositionY) * a;
					if (delta >= 0.2) {
						userPositionY += delta;
					} else {
						wasAtPositionY = goalPositionY;
						goalPositionY = 0; // simulate falling
					}
				} else {
					const a = 1 - Math.exp(-dt / TAU_Y);
					const _delta = (wasAtPositionY - userPositionY) * a * -1;
					const delta = Math.max(MAX_FREE_FALL_SPEED, _delta); // min fall speed capped
					if (delta == MAX_FREE_FALL_SPEED) {
						inMaxFreeFallSpeed = 1;
					}
					if (userPositionY + delta < 0) {
						userPositionY = 0;
					} else {
						userPositionY += delta;
					}
				}
			}

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	// $inspect(goalPositionY);

	// handle horizontal mouse move
	onMount(() => {
		if (!gameWindowRef) return;

		const handleMouseMove = (e) => {
			const rect = gameWindowRef.getBoundingClientRect();
			// X position relative to the element
			const mousePositionXTemp =
				(e.clientX - rect.left) / scale - USER_HITBOX_WIDTH / 2;
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
			if (userPositionY != 0) return;
			if (collidedThereforeGameStarted) return;
			if (showMenu) return;
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
				minXAxisValue: 0,
				maxXAxisValue: rect.width,
				minYAxisValue: 0,
				maxYAxisValue: rect.height,
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

		const audio = new Audio('./collectbell.mp3');
		audio.volume = volume;
		audio.play();

		const bellIndex = bellsArr.findIndex((e) => e.bellId == bellId);
		goalPositionY = userPositionY + BELL_HITBOX_HEIGHT + Y_JUMP;
		inMaxFreeFallSpeed = 0;
		createNewBell(bellIndex);
	};

	onMount(() => {
		const intervalId = setInterval(() => {
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

				if (
					scrollingBellsStartingYPositionPX + lowestYPositionPX <
					DESPAWN_BELL_APPROACHING_GROUND_AT_PX
				) {
					createNewBell(minIndex);
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	// remove all bells that is generally lower than DESPAWN_BELLS_BELOW_CURRENT_USER_LOCATION_BELLS bells below current userPosition
	onMount(() => {
		const intervalId = setInterval(() => {
			for (const [index, val] of bellsArr.entries()) {
				if (
					val.YPositionPX <
					userPositionY -
						Y_BETWEEN_BELLS_BASE_HEIGHT *
							DESPAWN_BELLS_BELOW_CURRENT_USER_LOCATION_BELLS
				) {
					createNewBell(index);
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	// remove all starburst that is generally lower than DESPAWN_STARBURST_OUT_OF_YPX_RANGE range below current userPosition
	onMount(() => {
		const intervalId = setInterval(() => {
			if (!inMaxFreeFallSpeed) {
				for (const [index, val] of starburstsArr.entries()) {
					if (
						val.YPositionPX <
						userPositionY - DESPAWN_STARBURST_OUT_OF_YPX_RANGE
					) {
						createNewStarburst({ index, isAscending: true });
					}
				}
			} else {
				for (const [index, val] of starburstsArr.entries()) {
					if (
						latestStarburstId >
						BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE + STARBURST_ID_START
					) {
						if (
							val.YPositionPX >
							userPositionY + DESPAWN_STARBURST_OUT_OF_YPX_RANGE
						) {
							createNewStarburst({ index, isAscending: false });
						}
					}
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	// Chrome (and most modern browsers) block autoplay of audio/video with sound until the user has interacted with the page
	// loads into buffer and plays from buffer to reduce the delay of autoplay restarting the loop
	onMount(() => {
		const interactedWithPage = () => {
			if (!userInteracted) {
				userInteracted = true;

				let audioContext;
				let buffer;
				let source;

				async function loadAudio() {
					if (!audioContext) {
						audioContext = new (window.AudioContext ||
							window.webkitAudioContext)();
						gainNode = audioContext.createGain(); // create a gain node
						gainNode.connect(audioContext.destination); // connect it to speakers
					}
					// Fetch and decode
					const response = await fetch('./idle.mp3'); // adjust path if needed
					const arrayBuffer = await response.arrayBuffer();
					buffer = await audioContext.decodeAudioData(arrayBuffer);
				}

				async function playLoop() {
					if (!buffer) await loadAudio();

					// Create a new source each time you play
					source = audioContext.createBufferSource();
					source.buffer = buffer;
					source.loop = true;

					// Connect source → gain → destination
					source.connect(gainNode);
					gainNode.gain.value = volume;

					source.start(0);
				}

				playLoop();
			}
		};

		// Listen for the first valid interaction
		document.addEventListener('click', interactedWithPage);
		document.addEventListener('keydown', interactedWithPage);
		document.addEventListener('touchstart', interactedWithPage);

		return () => {
			document.removeEventListener('click', interactedWithPage);
			document.removeEventListener('keydown', interactedWithPage);
			document.removeEventListener('touchstart', interactedWithPage);
		};
	});

	$effect(() => {
		if (gainNode) {
			gainNode.gain.value = volume;
		}
	});

	onMount(() => {
		const intervalId = setInterval(() => {
			if (collidedThereforeGameStarted && userPositionY == 0) {
				showMenu = true;
				collidedThereforeGameStarted = false;

				// will allow hiding by css originally, so there isnt a flicker of bells being removed from dom
				for (let index = 0; index < BELLS_MAX_COUNT; index++) {
					bellsArr[index].hidden = true;
				}
			}
		}, 10);

		return () => clearInterval(intervalId);
	});
</script>

<div
	bind:this={gameWindowRef}
	class="relative rounded-lg grow w-full h-full overflow-hidden bg-gray-800 select-none"
>
	<Menu bind:showMenu bind:volume />

	{#if !showMenu}
		{#each starburstsArr as starburst}
			<div
				class="text-white absolute"
				style="height: {STARBURST_BASE_HEIGHT_AND_WIDTH *
					starburst.multiplier}px; width: {STARBURST_BASE_HEIGHT_AND_WIDTH *
					starburst.multiplier}px; bottom: {starburst.YPositionPX -
					cameraPanningY}px; left:{starburst.XPositionPX}px; opacity: {STARBURST_BASE_OPACITY *
					starburst.multiplier}%;"
			>
				<Starburst />
			</div>
		{/each}
	{/if}

	<div
		class="absolute w-full flex items-center h-[{DESPAWN_BELL_APPROACHING_GROUND_AT_PX}px]"
		style="bottom: {-cameraPanningY - 150}px;"
	>
		<img src={forest} class="w-[850px]" alt="forest 1" />
		<img src={forest} class="w-[850px]" alt="forest 2" />
		<img src={forest} class="w-[850px]" alt="forest 3" />
	</div>

	<div
		id="user"
		class="absolute rounded-full bg-gray-500 fade-in-out"
		style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: {userPositionY -
			cameraPanningY}px; left:{userPositionX}px; opacity: {showMenu ? 0 : 1}"
	></div>
	{#if !showMenu}
		{#each bellsArr as bell}
			<img
				src={bellImg}
				alt="bell"
				id="bell-{bell.bellId}"
				class="absolute swing-bell fade-in"
				style="height: {USER_HITBOX_HEIGHT}px; width: {USER_HITBOX_WIDTH}px; bottom: {scrollingBellsStartingYPositionPX +
					bell.YPositionPX -
					cameraPanningY}px; left:{bell.XPositionPX}px; visibility: {bell.hidden
					? 'hidden'
					: 'visible'}"
			/>
		{/each}
	{/if}
</div>

<style>
	.swing-bell {
		display: block;
		width: 64px;
		height: 64px;
		animation: swing 2s linear infinite;
		transform-origin: 50% 0%; /* pivot at top center */
	}

	@keyframes swing {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(5deg);
		}
		50% {
			transform: rotate(0deg);
		}
		75% {
			transform: rotate(-5deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	.fade-in-out {
		transition: opacity 0.8s ease;
	}

	.fade-in {
		opacity: 0;
		animation: fadeIn 0.8s ease forwards; /* duration = 0.8s */
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
