<script>
	import { onDestroy, onMount } from 'svelte';
	import forest from '../assets/forest.png';
	import Menu from './Menu.svelte';
	import IdleMusic from './IdleMusic.svelte';
	import Bunny from './Bunny.svelte';
	import Bells from './Bells.svelte';
	import Starbursts from './Starbursts.svelte';
	import {
		bunnyPosition,
		cameraPanning,
		gameWindowDimensions,
		general,
		menu,
	} from '$lib/stores.svelte';
	import BunnyHandler from './BunnyHandler.svelte';
	import {
		BUNNY_HITBOX_WIDTH,
		DEFAULT_VOLUME,
		DESPAWN_BELL_APPROACHING_GROUND_AT_PX,
		Y_JUMP,
	} from '$lib/constants';
	import { globals } from '$lib/utils';

	let { scale } = $props();
	let gameWindowRef = $state();

	// set persisted state if possible
	onMount(() => {
		general.volume = localStorage.getItem('volume')
			? parseFloat(localStorage.getItem('volume'))
			: DEFAULT_VOLUME;
		general.previousScore = localStorage.getItem('previousScore')
			? parseInt(localStorage.getItem('previousScore'))
			: null;
	});

	// gameWindowDimensions
	onMount(() => {
		if (!gameWindowRef) return;

		// initialize bunnyPosition.x to the center
		bunnyPosition.x =
			gameWindowRef.getBoundingClientRect().width / 2 - BUNNY_HITBOX_WIDTH / 2;

		const updateDimensions = () => {
			const rect = gameWindowRef.getBoundingClientRect();
			gameWindowDimensions.width = rect.width;
			gameWindowDimensions.height = rect.height;
			gameWindowDimensions.maxXAxisValue = rect.width;
			gameWindowDimensions.maxYAxisValue = rect.height;
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

	// detect bunny has fallen, game has ended
	onMount(() => {
		const intervalId = setInterval(() => {
			if (globals.collidedThereforeGameStarted && bunnyPosition.y == 0) {
				menu.show = true;
				globals.collidedThereforeGameStarted = false;
			}
		}, 10);

		return () => clearInterval(intervalId);
	});
</script>

<div
	bind:this={gameWindowRef}
	class="relative rounded-lg grow w-full h-full overflow-hidden bg-gray-800 select-none"
>
	{#if gameWindowRef}
		<IdleMusic />
		<Menu />

		<div
			class="absolute w-full flex items-center h-[{DESPAWN_BELL_APPROACHING_GROUND_AT_PX}px]"
			style="bottom: {-cameraPanning.y - 150}px;"
		>
			<img src={forest} class="w-[850px]" alt="forest 1" />
			<img src={forest} class="w-[850px]" alt="forest 2" />
			<img src={forest} class="w-[850px]" alt="forest 3" />
		</div>

		{#if !menu.show}
			<div class="absolute top-[10px] left-[10px] text-white">
				{general.score}
			</div>
		{/if}
		<Starbursts />
		<Bells {gameWindowRef} />
		<BunnyHandler {gameWindowRef} {scale} />
	{/if}
</div>
