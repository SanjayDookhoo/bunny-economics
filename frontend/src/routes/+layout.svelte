<script>
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	// a simple check to ensure the earliest onMount lifecyle occurs, after this happens, the window object is available at the top level in any file, ie. window.localStorage
	let isReady = $state(false);
	onMount(() => {
		isReady = true;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isReady}
	{@render children?.()}
{/if}
