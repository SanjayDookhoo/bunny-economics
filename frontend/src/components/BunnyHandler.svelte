<script>
	import {
		BUNNY_GROUND_X_AXIS_MAX_DELTA,
		BUNNY_HITBOX_WIDTH,
		BUNNY_SKY_X_AXIS_MAX_DELTA,
		HORIZONTAL_INTERACTIVE_PADDING,
		MAX_FREE_FALL_SPEED,
	} from '$lib/constants';
	import {
		bunnyGoalPosition,
		bunnyPosition,
		cameraPanning,
		gameWindowDimensions,
	} from '$lib/stores.svelte';
	import { globals } from '$lib/utils';
	import { onMount } from 'svelte';
	import Bunny from './Bunny.svelte';

	let { gameWindowRef, scale } = $props();

	let bunnyGoalPositionYPrevForFallHandle = $state(0);

	let bunnyFacingDirection = $state('right');

	const updateCamera = (dt) => {
		const tau = globals.inMaxFreeFallSpeed ? 0 : 0.15; // smoothing: smaller = snappier, when in freefall make the camera snap faster, so the bunny doesnt go out of bounds because the camera cant keep up with the bunny falling
		const deadMin =
			(bunnyPosition.y > 250 ? 0.2 : 0) * gameWindowDimensions.height; // 20% from bottom, the bunnyPosition.y check ensures that when the game starts, the bunny remains planted on the ground, instead of the camera going lower than ground attempting to keep the bunny at the 20%  point
		const deadMax = 0.4 * gameWindowDimensions.height; // 40% from bottom

		// Where is the player on screen (from bottom)?
		const playerScreenY = bunnyPosition.y - cameraPanning.y;

		// Desired camera y (only change if player left the band)
		let cameraGoalY = cameraPanning.y;
		if (playerScreenY < deadMin) {
			cameraGoalY = bunnyPosition.y - deadMin; // push camera down
		} else if (playerScreenY > deadMax) {
			cameraGoalY = bunnyPosition.y - deadMax; // push camera up
		}

		// Smooth move: exponential smoothing toward desired
		const a = 1 - Math.exp(-dt / tau);
		cameraPanning.y += (cameraGoalY - cameraPanning.y) * a;
	};

	onMount(() => {
		let raf,
			prev = performance.now();
		function frame(now) {
			const dt = Math.min(0.1, (now - prev) / 1000);
			prev = now;

			updateCamera(dt);

			requestAnimationFrame(frame);
		}
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	});

	// check on interval
	// onmount here used to prevent hot reloading from stacking multiple intervals
	onMount(() => {
		let X_SPEED_PX_PER_SEC;
		let raf;
		let prev = performance.now();

		const tick = (now) => {
			if (bunnyPosition.y == 0) {
				X_SPEED_PX_PER_SEC = BUNNY_GROUND_X_AXIS_MAX_DELTA * 60;
			} else {
				X_SPEED_PX_PER_SEC = BUNNY_SKY_X_AXIS_MAX_DELTA * 60;
			}

			const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000)); // seconds
			prev = now;

			if (bunnyPosition.x !== undefined && bunnyGoalPosition.x !== undefined) {
				const minX =
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING;
				const maxX =
					gameWindowDimensions.maxXAxisValue -
					BUNNY_HITBOX_WIDTH -
					HORIZONTAL_INTERACTIVE_PADDING;

				// clamp goal to bounds
				bunnyGoalPosition.x = Math.max(
					minX,
					Math.min(maxX, bunnyGoalPosition.x)
				);

				if (bunnyPosition.x < minX) {
					bunnyPosition.x = bunnyGoalPosition.x = minX;
				} else if (bunnyPosition.x > maxX) {
					bunnyPosition.x = bunnyGoalPosition.x = maxX;
				} else {
					const dx = bunnyGoalPosition.x - bunnyPosition.x;
					const step = X_SPEED_PX_PER_SEC * dt;

					if (Math.abs(dx) <= step) {
						bunnyPosition.x = bunnyGoalPosition.x; // snap when close
					} else {
						bunnyPosition.x += Math.sign(dx) * step;
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

			if (bunnyPosition.y === undefined || bunnyGoalPosition.y === undefined) {
				raf = requestAnimationFrame(tick);
				return;
			}

			const minY = gameWindowDimensions.minYAxisValue;
			const maxY = gameWindowDimensions.maxYAxisValue - BUNNY_HITBOX_WIDTH;

			if (Math.abs(bunnyGoalPosition.y - bunnyPosition.y) < 1) {
				// snap when extremely close to avoid a long tiny tail
				// bunnyPosition.y = bunnyGoalPosition.y;
				bunnyGoalPosition.y = 0; // simulate falling
			} else {
				if (bunnyGoalPosition.y > bunnyPosition.y) {
					const a = 1 - Math.exp(-dt / TAU_Y);
					const delta = (bunnyGoalPosition.y - bunnyPosition.y) * a;
					if (delta >= 0.2) {
						bunnyPosition.y += delta;
					} else {
						bunnyGoalPositionYPrevForFallHandle = bunnyGoalPosition.y;
						bunnyGoalPosition.y = 0; // simulate falling
					}
				} else {
					const a = 1 - Math.exp(-dt / TAU_Y);
					const _delta =
						(bunnyGoalPositionYPrevForFallHandle - bunnyPosition.y) * a * -1;
					const delta = Math.max(MAX_FREE_FALL_SPEED, _delta); // min fall speed capped
					if (delta == MAX_FREE_FALL_SPEED) {
						globals.inMaxFreeFallSpeed = 1;
					}
					if (bunnyPosition.y + delta < 0) {
						bunnyPosition.y = 0;
					} else {
						bunnyPosition.y += delta;
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
			const mousePositionXTemp =
				(e.clientX - rect.left) / scale - BUNNY_HITBOX_WIDTH / 2;
			if (
				mousePositionXTemp >= gameWindowDimensions.minXAxisValue &&
				mousePositionXTemp <=
					gameWindowDimensions.maxXAxisValue - BUNNY_HITBOX_WIDTH
			) {
				bunnyGoalPosition.x = mousePositionXTemp;

				if (mousePositionXTemp <= bunnyPosition.x) {
					bunnyFacingDirection = 'left';
				} else {
					bunnyFacingDirection = 'right';
				}
			}
		};

		gameWindowRef.addEventListener('mousemove', handleMouseMove);

		return () => {
			gameWindowRef.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

<Bunny {bunnyFacingDirection} {bunnyGoalPositionYPrevForFallHandle} />
