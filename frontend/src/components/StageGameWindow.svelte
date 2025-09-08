<script>
	import { onMount } from 'svelte';
	import GameWindow from './GameWindow.svelte';

	let scale = $state(1);

	onMount(() => {
		// Scales the stage to fit the current box while preserving the base ratio
		const box = document.querySelector('.ar-box');
		const stage = document.getElementById('stage');

		const BASE_W = 1280; // match .stage width
		const BASE_H = 720; // match .stage height

		const ro = new ResizeObserver(([entry]) => {
			const { inlineSize: w, blockSize: h } = entry.contentBoxSize
				? Array.isArray(entry.contentBoxSize)
					? entry.contentBoxSize[0]
					: entry.contentBoxSize
				: { inlineSize: box.clientWidth, blockSize: box.clientHeight };

			// Compute scale to fit while preserving aspect
			scale = Math.min(w / BASE_W, h / BASE_H);

			// Apply scale and center letterboxing
			stage.style.transform = `scale(${scale})`;

			// Center horizontally/vertically by adding leftover space as margins
			const scaledW = BASE_W * scale;
			const scaledH = BASE_H * scale;
			stage.style.left = `${(w - scaledW) / 2}px`;
			stage.style.top = `${(h - scaledH) / 2}px`;
		});

		// set aspect-ratio from data attribute if provided
		const ar = box.getAttribute('data-ar');
		if (ar) box.style.setProperty('--ar', ar);

		ro.observe(box);

		return () => {
			ro.disconnect();
		};
	});
</script>

<div class="ar-box" data-ar="16 / 9">
	<div class="stage" id="stage">
		<GameWindow {scale} />
	</div>
</div>

<style>
	/* Outer box keeps aspect ratio */
	.ar-box {
		aspect-ratio: var(--ar, 16 / 9);
		width: min(100vw, 100%);
		height: auto;
		position: relative;
		overflow: hidden;
	}

	/* The inner "design canvas"—pick your base size (e.g., 1280×720) */
	.stage {
		width: 1280px; /* base width */
		height: 720px; /* base height */
		transform-origin: top left;
		position: absolute;
		left: 0;
		top: 0;
		/* optional: make text scale crisp */
		image-rendering: auto;
	}
</style>
