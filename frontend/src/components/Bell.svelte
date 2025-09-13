<script>
	import { BELL_POINTS_INCREMENT } from '$lib/constants';
	import { cameraPanning, general, menu } from '$lib/stores.svelte';
	import { onMount } from 'svelte';
	import bellImg from '../assets/bell.png';

	let { bellId, bell, bellsFallingAmount, bellHeight, bellWidth } = $props();
</script>

<div
	id="bell-{bellId}"
	class="absolute"
	style="bottom: {bellsFallingAmount +
		bell.YPositionPX -
		cameraPanning.y}px; left:{bell.XPositionPX}px;"
>
	<img
		class="swing-bell fade-in"
		src={bellImg}
		alt="bell"
		style="height: {bellHeight}px; width: {bellWidth}px; visibility: {bell.hidden
			? 'hidden'
			: 'visible'}"
	/>
</div>

<style>
	.swing-bell {
		display: block;
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
