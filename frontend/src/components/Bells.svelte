<script>
	import {
		BELL_HITBOX_HEIGHT,
		BELL_POSITION_Y_VARIANCE_AMOUNT,
		BELLS_AUTO_FALL_SPEED_PER_SEC,
		BELLS_MAX_COUNT,
		BUNNY_HITBOX_HEIGHT,
		BUNNY_HITBOX_WIDTH,
		DESPAWN_BELL_APPROACHING_GROUND_AT_PX,
		DESPAWN_BELLS_BELOW_CURRENT_BUNNY_LOCATION_BELLS,
		FIRST_BELL_Y_POSITION_PX,
		HORIZONTAL_INTERACTIVE_PADDING,
		Y_BETWEEN_BELLS_BASE_HEIGHT,
		Y_JUMP,
	} from '$lib/constants';
	import {
		bunnyGoalPosition,
		bunnyPosition,
		cameraPanning,
		gameWindowDimensions,
		general,
		menu,
	} from '$lib/stores.svelte';
	import { onDestroy, onMount } from 'svelte';
	import Bell from './Bell.svelte';
	import { fxPopShine } from '$lib/collisionEffects';
	import { getRandomFloatInclusive, globals } from '$lib/utils';

	let { gameWindowRef } = $props();

	let bellsObj = $state({});
	let bellsFallingAmount = $state(250);

	let latestBellId = 1;
	let latestBellPositionY = 0;

	$effect(() => {
		if (menu.show) {
			for (const bellId of Object.keys(bellsObj)) {
				removeBell(bellId);
			}
		}
	});

	$effect(() => {
		if (!menu.show) {
			latestBellPositionY = FIRST_BELL_Y_POSITION_PX;
			bellsFallingAmount = 0;
			for (let index = 0; index < BELLS_MAX_COUNT; index++) {
				createNewBell();
			}
		}
	});

	const createNewBell = () => {
		latestBellId++;

		const currentBellId = latestBellId;
		const intervalId = setInterval(() => {
			checkIfCollideWithBell(currentBellId);
		}, 10);

		const YVariance = getRandomFloatInclusive(
			0,
			BELL_POSITION_Y_VARIANCE_AMOUNT
		);
		const YPositionPX =
			latestBellPositionY + Y_BETWEEN_BELLS_BASE_HEIGHT + YVariance;

		const bell = {
			YPositionPX,
			XPositionPX: getRandomFloatInclusive(
				gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
				gameWindowDimensions.maxXAxisValue -
					BUNNY_HITBOX_WIDTH -
					HORIZONTAL_INTERACTIVE_PADDING
			),
			hidden: false,
		};

		bellsObj[latestBellId] = bell;
		latestBellPositionY = YPositionPX;
	};

	// ensures on hot reload the intervals for collision check are cleared
	onDestroy(() => {
		for (const { intervalId } of Object.values(bellsObj)) {
			clearInterval(intervalId);
		}
	});

	// bells scroll
	onMount(() => {
		let raf,
			prev = performance.now();

		const tick = (now) => {
			const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000)); // seconds
			prev = now;

			bellsFallingAmount -= BELLS_AUTO_FALL_SPEED_PER_SEC * dt;

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const checkIfCollideWithBell = (bellId) => {
		const bell = document.getElementById(`bell-${bellId}`);
		const bunny = document.getElementById('bunny');
		if (!bell || !bunny) return;

		var rect1 = bell.getBoundingClientRect();
		var rect2 = bunny.getBoundingClientRect();

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

	const removeBell = (bellId) => {
		clearInterval(bellsObj[bellId].intervalId);
		delete bellsObj[bellId];
	};

	const removeAndCreateNewBell = (bellId) => {
		removeBell(bellId);
		createNewBell();
	};

	const handleCollide = (bellId) => {
		if (!globals.collidedThereforeGameStarted) {
			globals.collidedThereforeGameStarted = true;
		}

		if (bellsObj[bellId].collided) return;

		bellsObj[bellId].collided = true;

		const audio = new Audio('./collectbell.mp3');
		audio.volume = general.volume;
		audio.play();

		clearInterval(bellsObj[bellId].intervalId);
		bellsObj[bellId].hidden = true;
		setTimeout(() => {
			delete bellsObj[bellId];
		}, 2000);
		createNewBell();
		fxPopShine(document.getElementById('bell-' + bellId), 10);

		bunnyGoalPosition.y = bunnyPosition.y + BELL_HITBOX_HEIGHT + Y_JUMP;
		globals.inMaxFreeFallSpeed = 0;

		general.score += 10;
	};

	onMount(() => {
		const intervalId = setInterval(() => {
			let minId = -1;
			let minValue = Infinity;
			for (const [bellId, bell] of Object.entries(bellsObj)) {
				if (bell.YPositionPX < minValue) {
					minValue = bell.YPositionPX;
					minId = bellId;
				}
			}
			if (minId != -1) {
				const lowestYPositionPX = minValue;

				if (
					bellsFallingAmount + lowestYPositionPX <
					DESPAWN_BELL_APPROACHING_GROUND_AT_PX
				) {
					removeAndCreateNewBell(minId);
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	// remove all bells that is generally lower than DESPAWN_BELLS_BELOW_CURRENT_BUNNY_LOCATION_BELLS bells below current bunnyPosition
	onMount(() => {
		const intervalId = setInterval(() => {
			for (const [bellId, bell] of Object.entries(bellsObj)) {
				if (
					bell.YPositionPX <
					bunnyPosition.y -
						Y_BETWEEN_BELLS_BASE_HEIGHT *
							DESPAWN_BELLS_BELOW_CURRENT_BUNNY_LOCATION_BELLS
				) {
					removeAndCreateNewBell(bellId);
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	// mouse click to jump
	onMount(() => {
		if (!gameWindowRef) return;

		const handleClick = (e) => {
			if (e.button !== 0) return; // only allow left click
			if (bunnyPosition.y != 0) return;
			if (globals.collidedThereforeGameStarted) return;
			if (menu.show) return;
			bunnyGoalPosition.y += Y_JUMP;
		};

		gameWindowRef.addEventListener('click', handleClick);

		return () => {
			gameWindowRef.removeEventListener('click', handleClick);
		};
	});
</script>

{#if !menu.show}
	{#each Object.entries(bellsObj) as [bellId, bell] (bellId)}
		<Bell {bellId} {bell} {bellsFallingAmount} />
	{/each}
{/if}
