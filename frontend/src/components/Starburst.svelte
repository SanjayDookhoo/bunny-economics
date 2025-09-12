<script>
	import {
		STARBURST_BASE_HEIGHT_AND_WIDTH,
		STARBURST_BASE_OPACITY,
	} from '$lib/constants';
	import { cameraPanning } from '$lib/stores.svelte';
	import StarburstSvg from './StarburstSVG.svelte';

	let { starburstId, starburst } = $props();
</script>

<div
	class="text-white absolute"
	id="starburst-{starburstId}"
	style="height: {STARBURST_BASE_HEIGHT_AND_WIDTH *
		starburst.multiplier}px; width: {STARBURST_BASE_HEIGHT_AND_WIDTH *
		starburst.multiplier}px; bottom: {starburst.YPositionPX -
		cameraPanning.y}px; left:{starburst.XPositionPX}px; opacity: {STARBURST_BASE_OPACITY *
		starburst.multiplier}%;"
>
	<StarburstSvg />
</div>
