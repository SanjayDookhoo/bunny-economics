<script>
	import { onMount } from 'svelte';

	const xAxisMaxDelta = 15;

	let xAxisCurrentInterval;
	let yAxisCurrentInterval;
	let xAxisMouseIntervalId;

	let mousePositionX = $state(0);
	let userPositionX = $state(0);
	let userPositionY = $state(0);
	let userFacingDirection = $state('right');
	let gameWindowDimensions = $state({
		width: 0,
		height: 0,
	});
	let gameWindowRef = $state();

	// check on interval
	// onmount here used to prevent hot reloading from stacking multiple intervals
	onMount(() => {
		xAxisMouseIntervalId = setInterval(() => {
			if (Math.abs(mousePositionX - userPositionX) <= xAxisMaxDelta) {
				userPositionX = mousePositionX; // close enough, snap to target
			} else {
				if (mousePositionX < userPositionX) {
					userPositionX -= xAxisMaxDelta;
				} else if (mousePositionX > userPositionX) {
					userPositionX += xAxisMaxDelta;
				}
			}
		}, 16);

		return () => clearInterval(xAxisMouseIntervalId);
	});

	// handle horizontal mouse move
	onMount(() => {
		if (!gameWindowRef) return;

		const handleMouseMove = (e) => {
			const rect = gameWindowRef.getBoundingClientRect();
			// X position relative to the element
			mousePositionX = e.clientX - rect.left;
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
