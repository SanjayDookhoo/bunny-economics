<script>
	import { BUNNY_HITBOX_HEIGHT, BUNNY_HITBOX_WIDTH } from '$lib/constants';
	import { cameraPanning } from '$lib/stores.svelte';
	import bellImg from '../assets/bell.png';

	let { bellId, bell, bellsFallingAmount } = $props();
</script>

<div
	id="bell-{bellId}"
	class="absolute"
	style="height: {BUNNY_HITBOX_HEIGHT}px; width: {BUNNY_HITBOX_WIDTH}px; bottom: {bellsFallingAmount +
		bell.YPositionPX -
		cameraPanning.y}px; left:{bell.XPositionPX}px;"
>
	<img
		class="swing-bell fade-in"
		src={bellImg}
		alt="bell"
		style="visibility: {bell.hidden ? 'hidden' : 'visible'}"
	/>
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
