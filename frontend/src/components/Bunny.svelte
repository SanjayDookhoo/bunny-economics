<script>
	import { BUNNY_HITBOX_HEIGHT, BUNNY_HITBOX_WIDTH } from '$lib/constants';
	import {
		bunnyPosition,
		bunnyGoalPosition,
		cameraPanning,
		menu,
	} from '$lib/stores.svelte';
	import { onMount } from 'svelte';

	onMount(() => {});
</script>

<div
	id="bunny"
	class="absolute rounded-full bg-gray-500 fade-in-out"
	style="height: {BUNNY_HITBOX_HEIGHT}px; width: {BUNNY_HITBOX_WIDTH}px; bottom: {bunnyPosition.y -
		cameraPanning.y}px; left:{bunnyPosition.x}px; opacity: {menu.show ? 0 : 1}"
></div>

<style>
	.fade-in-out {
		transition: opacity 0.8s ease;
	}
</style>
