<script>
	import {
		BELL_POSITION_Y_VARIANCE_AMOUNT,
		BELLS_MAX_COUNT,
		BUNNY_HITBOX_WIDTH,
		DESPAWN_STARBURST_OUT_OF_Y_RANGE,
		HORIZONTAL_INTERACTIVE_PADDING,
		STARBURST_COUNT_PER_RANGE,
		STARBURST_HEIGHT_RANGE,
		STARBURST_ID_START,
	} from '$lib/constants';
	import {
		bunnyPosition,
		gameWindowDimensions,
		menu,
	} from '$lib/stores.svelte';
	import { getRandomFloatInclusive, globals } from '$lib/utils';
	import { onMount } from 'svelte';
	import Starburst from './Starburst.svelte';

	let latestStarburstRowId = STARBURST_ID_START;

	let starburstsObj = $state({});

	const removeStarburst = (starburstId) => {
		delete starburstsObj[starburstId];
	};

	const removeAndCreateNewStarburst = (starburstId, isAscending) => {
		removeStarburst(starburstId);
		createNewStarburst(isAscending);
	};

	const createNewStarburst = (isAscending) => {
		let starburst;
		const YVariance = getRandomFloatInclusive(
			0,
			BELL_POSITION_Y_VARIANCE_AMOUNT
		);
		if (isAscending) {
			latestStarburstRowId++;
			starburst = {
				YPositionPX: getRandomFloatInclusive(
					latestStarburstRowId * STARBURST_HEIGHT_RANGE,
					latestStarburstRowId * (STARBURST_HEIGHT_RANGE + 1)
				),
				XPositionPX: getRandomFloatInclusive(
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
					gameWindowDimensions.maxXAxisValue -
						BUNNY_HITBOX_WIDTH -
						HORIZONTAL_INTERACTIVE_PADDING
				),
				multiplier: getRandomFloatInclusive(1, 2),
			};
		} else {
			latestStarburstRowId--;
			starburst = {
				YPositionPX: getRandomFloatInclusive(
					(latestStarburstRowId - BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE) *
						STARBURST_HEIGHT_RANGE,
					(latestStarburstRowId - BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE) *
						(STARBURST_HEIGHT_RANGE + 1)
				),
				XPositionPX: getRandomFloatInclusive(
					gameWindowDimensions.minXAxisValue + HORIZONTAL_INTERACTIVE_PADDING,
					gameWindowDimensions.maxXAxisValue -
						BUNNY_HITBOX_WIDTH -
						HORIZONTAL_INTERACTIVE_PADDING
				),
				multiplier: getRandomFloatInclusive(1, 2),
			};
		}

		starburstsObj[crypto.randomUUID()] = starburst;
	};

	// remove all starburst that is out of range in the opposite direction (up or down) heading towards
	onMount(() => {
		const intervalId = setInterval(() => {
			if (!globals.inMaxFreeFallSpeed) {
				for (const [starburstId, starburst] of Object.entries(starburstsObj)) {
					if (
						starburst.YPositionPX <
						bunnyPosition.y - DESPAWN_STARBURST_OUT_OF_Y_RANGE
					) {
						removeAndCreateNewStarburst(starburstId, true);
					}
				}
			} else {
				for (const [starburstId, starburst] of Object.entries(starburstsObj)) {
					if (
						latestStarburstRowId >
						BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE + STARBURST_ID_START
					) {
						if (
							starburst.YPositionPX >
							bunnyPosition.y + DESPAWN_STARBURST_OUT_OF_Y_RANGE
						) {
							removeAndCreateNewStarburst(starburstId, false);
						}
					}
				}
			}
		}, 50);

		return () => clearInterval(intervalId);
	});

	$effect(() => {
		if (menu.show) {
			for (const starburstId of Object.keys(starburstsObj)) {
				removeStarburst(starburstId);
			}
		}
	});

	$effect(() => {
		if (!menu.show) {
			for (
				let index = 0;
				index < BELLS_MAX_COUNT * STARBURST_COUNT_PER_RANGE;
				index++
			) {
				createNewStarburst(true);
			}
		}
	});
</script>

{#if !menu.show}
	{#each Object.entries(starburstsObj) as [starburstId, starburst] (starburstId)}
		<Starburst {starburstId} {starburst} />
	{/each}
{/if}
