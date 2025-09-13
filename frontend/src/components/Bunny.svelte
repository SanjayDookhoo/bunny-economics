<script>
	import {
		BUNNY_HITBOX_HEIGHT,
		BUNNY_HITBOX_WIDTH,
		BUNNY_SPRITE_ANIMATIONS_MAP,
	} from '$lib/constants';
	import {
		bunnyPosition,
		bunnyGoalPosition,
		cameraPanning,
		menu,
	} from '$lib/stores.svelte';
	import { onMount } from 'svelte';

	let { bunnyFacingDirection, bunnyGoalPositionYPrevForFallHandle } = $props();

	let bunnySpriteAnimation = $state('idle');
	let bunnySpriteAnimationFrame = $state({
		width: 0,
		height: 0,
		x: 0,
		w: 0,
		angle: 0,
	});
	let bunnySpriteFlip = $state(false);

	let bunnySpriteAnimationInterval;
	let bunnySpriteRunningFrame = 1;

	const SCALE = 0.3;

	$effect(() => {
		bunnySpriteFlip = bunnyFacingDirection == 'right';
	});

	$effect(() => {
		if (bunnyPosition.y == 0) {
			if (bunnyPosition.x == bunnyGoalPosition.x) {
				bunnySpriteAnimation = 'idle';
			} else {
				bunnySpriteAnimation = 'running';
			}
		} else {
			bunnySpriteAnimation = 'hopping';
		}
	});

	$effect(() => {
		clearInterval(bunnySpriteAnimationInterval);
		if (bunnySpriteAnimation == 'idle') {
			const animation = BUNNY_SPRITE_ANIMATIONS_MAP['idle'][0];
			// const animation = BUNNY_SPRITE_ANIMATIONS_MAP['hopping'][12];
			bunnySpriteAnimationFrame = animation;
		} else if (bunnySpriteAnimation == 'running') {
			bunnySpriteRunningFrame = 1;
			const runningAnimations = BUNNY_SPRITE_ANIMATIONS_MAP['running'];

			bunnySpriteAnimationFrame = runningAnimations[0]; // show first without interval delay

			bunnySpriteAnimationInterval = setInterval(() => {
				bunnySpriteAnimationFrame =
					runningAnimations[
						bunnySpriteRunningFrame++ % runningAnimations.length
					];
			}, 60);
		} else if (bunnySpriteAnimation == 'hopping') {
			bunnySpriteAnimationInterval = setInterval(() => {
				const hoppingAnimations = BUNNY_SPRITE_ANIMATIONS_MAP['hopping'];

				let angle;
				const apexRange = 60;
				if (bunnyGoalPosition.y > bunnyPosition.y) {
					if (bunnyGoalPosition.y - bunnyPosition.y < apexRange) {
						angle = ((bunnyGoalPosition.y - bunnyPosition.y) / apexRange) * 30;
					} else {
						angle = 30;
					}
				} else {
					if (
						Math.abs(bunnyPosition.y - bunnyGoalPositionYPrevForFallHandle) <
						apexRange
					) {
						angle =
							((bunnyPosition.y - bunnyGoalPositionYPrevForFallHandle) /
								apexRange) *
							30;
					} else {
						angle = -30;
					}
				}

				bunnySpriteAnimationFrame = {
					...hoppingAnimations[0],
					angle,
				};
			}, 10);
		}
	});

	// $inspect(bunnySpriteAnimationFrame);
</script>

<div
	id="bunny"
	class="absolute fade-in-out"
	style="height: {BUNNY_HITBOX_HEIGHT}px; width: {BUNNY_HITBOX_WIDTH}px; bottom: {bunnyPosition.y -
		cameraPanning.y}px; left:{bunnyPosition.x}px; opacity: {menu.show ? 0 : 1}"
>
	<div
		id="bunny-sprite"
		class="absolute"
		style="width: {bunnySpriteAnimationFrame.width}px; height: {bunnySpriteAnimationFrame.height}px; background-position: -{bunnySpriteAnimationFrame.x}px -{bunnySpriteAnimationFrame.y}px; transform: scaleX({SCALE *
			(bunnySpriteFlip
				? -1
				: 1)}) scaleY({SCALE}) rotate({bunnySpriteAnimationFrame.angle}deg); left: {-(
			bunnySpriteAnimationFrame.width / 2
		)}px; top: {-(bunnySpriteAnimationFrame.height / 2)}px;"
	></div>
</div>

<style>
	.fade-in-out {
		transition: opacity 0.8s ease;
	}

	#bunny-sprite {
		/* Base setup */
		width: 100px; /* default width of the visible area */
		height: 100px; /* default height of the visible area */
		background-image: url('./bunny-spritesheet.png');
		background-repeat: no-repeat;
		overflow: hidden;

		transform-origin: center; /* rotate around center */
		will-change: transform; /* smoother animations */
		image-rendering: pixelated; /* optional for crisp sprites */
	}
</style>
