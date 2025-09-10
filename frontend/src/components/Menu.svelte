<script>
	import { onMount } from 'svelte';

	let { showMenu = $bindable(), volume = $bindable() } = $props();

	const options = ['Scoreboard', 'How to play', 'Settings'];
	let playedBefore = $state(false);
	let optionSelected = $derived(playedBefore ? 'Scoreboard' : 'How to play');

	let inFullscreen = $state(false);

	// this ensures that the true state of inFullscreen is kept, because the user can exit the fullscreen with the keyboard "Escape" button, hence continuously checking the fullscreen state is required
	onMount(() => {
		const intervalId = setInterval(() => {
			inFullscreen = !!document.fullscreenElement;
		}, 200);

		return () => clearInterval(intervalId);
	});

	const toggleFullscreen = () => {
		const elem = document.getElementById('ar-box');

		if (!document.fullscreenElement) {
			// request fullscreen on the element
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.webkitRequestFullscreen) {
				/* Safari */
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) {
				/* IE11 */
				elem.msRequestFullscreen();
			}
		} else {
			// exit fullscreen
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		}
	};

	const playButtonHandler = () => {
		showMenu = false;
		playedBefore = true;
	};

	// updates localStorage for persistence of user preference
	$effect(() => {
		localStorage.setItem('volume', volume);
	});
</script>

<div class="flex justify-center {showMenu ? '' : 'hidden'}">
	<div class="bg-zinc-400 w-[800px] h-[400px] m-[50px] flex flex-col">
		<div class="grow flex">
			<div class="flex flex-col items-start">
				{#each options.filter((option) => playedBefore || (!playedBefore && option != 'Scoreboard')) as option}
					<button
						onclick={() => (optionSelected = option)}
						class={optionSelected == option ? 'bg-yellow-500' : ''}
					>
						{option}
					</button>
				{/each}
			</div>
			<div>
				{#if optionSelected == 'Scoreboard'}
					Scoreboard
				{:else if optionSelected == 'How to play'}
					How to play
				{:else if optionSelected == 'Settings'}
					Settings
				{/if}
			</div>
		</div>
		<div class="flex justify-center">
			<button onclick={playButtonHandler}>
				{playedBefore ? 'Play Again' : 'Play'}
			</button>
		</div>
		<button onclick={toggleFullscreen}>
			{inFullscreen ? 'Exit' : ''} Fullscreen
		</button>
		<div>
			<label for="volume">Volume:</label>
			<input
				type="range"
				id="points"
				name="volume"
				min="0"
				max="1"
				step="0.05"
				bind:value={volume}
			/>
		</div>
	</div>
</div>
