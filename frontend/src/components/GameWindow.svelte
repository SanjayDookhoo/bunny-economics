<script>
	import { onMount } from 'svelte';

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;

	let userPositionX = $state(0);
	let userPositionY = $state(0);
	let userFacingDirection = $state('right');
	let gameWindowDimensions = $state({
		width: 0,
		height: 0,
	});
	let gameWindowRef;

	// Move current toward target with a maximum change per step as maxDelta.
	const moveTowards = (current, target, maxDelta) => {
		if (Math.abs(target - current) <= maxDelta) {
			return target; // close enough, snap to target
		}
		return current + Math.sign(target - current) * maxDelta;
	};

	const moveHorizontallyOnGround = (xAxisPosition) => {
		if (userPositionY != 0) return;

		clearInterval(xAxisCurrentInterval);

		// simulate animation loop
		xAxisCurrentInterval = setInterval(() => {
			userPositionX = moveTowards(userPositionX, xAxisPosition, 10);
		}, 16); // ~60fps
	};

	// handle horizontal mouse move
	onMount(() => {
		if (!gameWindowRef) return;

		const handleMouseMove = (e) => {
			const rect = gameWindowRef.getBoundingClientRect();
			// X position relative to the element
			const xAxisPosition = e.clientX - rect.left;

			moveHorizontallyOnGround(xAxisPosition);
		};

		gameWindowRef.addEventListener('mousemove', handleMouseMove);

		return () => {
			gameWindowRef.removeEventListener('mousemove', handleMouseMove);
		};
	});

	// gameWindowDimensions
	onMount(() => {
		if (!gameWindowRef) return;

		const updateDimensions = () => {
			const rect = gameWindowRef.getBoundingClientRect();
			gameWindowDimensions = {
				width: rect.width,
				height: rect.height,
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
</script>

<div class="w-screen h-screen p-4">
	<div
		bind:this={gameWindowRef}
		class="border border-gray-300 rounded-lg h-full w-full relative"
	>
		<div
			class="absolute rounded-full bg-gray-500 h-16 w-16"
			style="bottom: 0; left:{userPositionX}px"
		></div>
	</div>
</div>
