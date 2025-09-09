<script>
	let { showMenu = $bindable() } = $props();

	const options = ['Scoreboard', 'How to play', 'Settings'];
	let playedBefore = $state(false);
	let optionSelected = $state('Scoreboard');

	const playButtonHandler = () => {
		showMenu = false;
		playedBefore = true;
	};
</script>

<div class="flex justify-center {showMenu ? '' : 'hidden'}">
	<div class="bg-zinc-400 w-[800px] h-[400px] m-[50px] flex flex-col">
		<div class="grow flex">
			<div class="flex flex-col items-start">
				{#each options as option}
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
	</div>
</div>
