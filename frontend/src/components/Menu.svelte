<script>
	import {
		bunnyFocusedNotes,
		economyFocusedNotes,
		esistentialBunnyNotes,
		preNotes,
	} from '$lib/economyNotes';
	import { general, menu } from '$lib/stores.svelte';
	import { getRandomFloatInclusive, getRandomIntInclusive } from '$lib/utils';
	import { onMount } from 'svelte';

	const options = ['Scoreboard', 'How to play'];
	let playedBefore = $state(false);
	let optionSelected = $derived(playedBefore ? 'Scoreboard' : 'How to play');

	let inFullscreen = $state(false);
	let scoreEvaluation = $state();
	let scoreEvaluationColor = $state();
	let note = $state();
	let preNote = $state();

	$effect(() => {
		if (
			general.previousScore == null ||
			general.score > general.previousScore
		) {
			scoreEvaluation = 'arrow_upward_alt';
			scoreEvaluationColor = 'green';
		} else if (general.score < general.previousScore) {
			scoreEvaluation = 'arrow_downward_alt';
			scoreEvaluationColor = 'red';
		} else {
			scoreEvaluation = 'horizontal_rule';
			scoreEvaluationColor = 'gray';
		}
	});

	$effect(() => {
		if (menu.show) {
			let type;
			if (scoreEvaluationColor == 'green') type = 'blessings';
			if (scoreEvaluationColor == 'red') type = 'challenges';
			if (scoreEvaluationColor == 'gray') type = 'neutral';

			// preNote
			const randForPreNote = getRandomIntInclusive(0, preNotes[type].length);
			preNote = preNotes[type][randForPreNote];

			// note
			const randForEvent = getRandomFloatInclusive(0, 100);
			if (randForEvent < 10 || scoreEvaluationColor == 'gray') {
				// 10% esistentialBunnyNotes
				const randForNote = getRandomIntInclusive(
					0,
					esistentialBunnyNotes.length
				);
				note = esistentialBunnyNotes[randForNote];
			} else if (randForEvent < 30) {
				// 20% bunnyFocusedNotes
				const randForNote = getRandomIntInclusive(
					0,
					bunnyFocusedNotes[type].length
				);
				note = bunnyFocusedNotes[type][randForNote];
			} else {
				// 70% economyFocusedNotes
				const randForNote = getRandomIntInclusive(
					0,
					economyFocusedNotes[type].length
				);
				note = economyFocusedNotes[type][randForNote];
			}
		}
	});

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
		if (playedBefore) {
			general.previousScore = general.score;
		}
		general.score = 0;
		menu.show = false;
		playedBefore = true;
	};

	const optionsFilter = (option) =>
		playedBefore || (!playedBefore && option != 'Scoreboard');

	// updates localStorage for persistence of user preference
	$effect(() => {
		localStorage.setItem('volume', general.volume);
	});
	$effect(() => {
		if (general.score != 0) {
			localStorage.setItem('previousScore', general.score);
		}
	});
</script>

<div class="flex justify-center {menu.show ? '' : 'hidden'}">
	<div class="menu w-[800px] h-[400px] m-[50px] flex flex-col rounded-lg p-2">
		<div class="flex justify-end [&>*]:m-1">
			<div class="volume">
				<label for="volume">Volume:</label>
				<input
					type="range"
					id="points"
					name="volume"
					min="0"
					max="1"
					step="0.01"
					bind:value={general.volume}
				/>
			</div>
			<button class="pill-btn" onclick={toggleFullscreen}>
				{#if inFullscreen}
					<span class="material-symbols-outlined"> fullscreen_exit </span>
				{:else}
					<span class="material-symbols-outlined"> fullscreen </span>
				{/if}
				{inFullscreen ? 'Exit' : ''} Fullscreen
			</button>
		</div>

		<div class="grow flex">
			{#if options.filter(optionsFilter).length != 1}
				<nav class="panel-left">
					{#each options.filter(optionsFilter) as option}
						<button
							onclick={() => (optionSelected = option)}
							class="nav-btn {optionSelected == option ? 'is-active' : ''}"
						>
							{option}
						</button>
					{/each}
				</nav>
			{/if}
			<main class="panel-main grow">
				{#if optionSelected == 'Scoreboard'}
					<h2>Scoreboard / Global Headlines</h2>
					<div class="flex flex-col text-white [&>*]:mb-2">
						<div class="flex items-center">
							<span
								class="material-symbols-outlined"
								style="color: {scoreEvaluationColor}"
							>
								{scoreEvaluation}
							</span>
							<div class="pl-2 flex">
								<div class="font-bold">Score:</div>
								<div class="pl-2">{general.score}</div>
							</div>
							{#if general.previousScore !== null}
								<div class="pl-8 flex">
									<div class="font-bold">Previous Score:</div>
									<div class="pl-2">{general.previousScore}</div>
								</div>
							{/if}
						</div>
						<div class="text-center italic">{preNote}</div>
						<div>
							<div class="flex">
								{#if note?.title}
									<div class="w-14 font-bold">Title:</div>
									<div>{note.title}</div>
								{/if}
							</div>

							<div class="flex">
								{#if note?.effect}
									<div class="w-14 font-bold">Effect:</div>
									<div>{note.effect}</div>
								{/if}
							</div>
						</div>

						<div class="italic">{note.flavor}</div>
					</div>
				{:else if optionSelected == 'How to play'}
					<h2>How to play</h2>

					<ul class="list-disc pl-6">
						<li>Use your mouse to move</li>
						<li>Click mouse button to jump for the first time</li>
						<li>Touch the bells to increase your score and jump higher</li>
						<li>Learn about economics from the Scoreboard Headlines!!</li>
					</ul>
				{/if}
			</main>
		</div>
		<div class="flex justify-center m-2">
			<button class="cta" onclick={playButtonHandler}>
				{playedBefore ? 'Play Again' : 'Play'}
			</button>
		</div>
	</div>
</div>

<style>
	:root {
		--bg1: #0f172a;
		--bg2: #1f2937;
		--glass: rgba(255, 255, 255, 0.06);
		--glass-strong: rgba(255, 255, 255, 0.1);
		--border: rgba(255, 255, 255, 0.15);
		--text: #e5e7eb;
		--muted: #9ca3af;
		--brand: #eab308;
		--brand-600: #ca8a04;
		--radius: 16px;
		--shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
	}

	.volume {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--glass);
		backdrop-filter: blur(10px);
	}
	.volume label {
		font-size: 14px;
		color: var(--muted);
	}
	.volume input {
		width: 200px;
		accent-color: var(--brand);
	}

	.menu {
		background: radial-gradient(
				800px 500px at 10% -10%,
				rgba(234, 179, 8, 0.18),
				transparent 60%
			),
			radial-gradient(
				900px 600px at 100% 110%,
				rgba(59, 130, 246, 0.18),
				transparent 60%
			),
			linear-gradient(160deg, var(--bg1), var(--bg2));
		border: black solid;
	}

	.pill-btn {
		color: var(--muted);
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--glass);
		backdrop-filter: blur(10px);
		transition:
			transform 0.12s ease,
			background 0.2s ease;
	}
	.pill-btn:hover {
		transform: translateY(-1px);
		background: var(--glass-strong);
	}

	.panel-left {
		align-self: start;
		padding: 12px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--glass);
		backdrop-filter: blur(10px);
		box-shadow: var(--shadow);
	}
	.nav-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		margin: 6px 0;
		border-radius: 12px;
		background: transparent;
		border: 1px solid transparent;
		color: var(--text);
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.2s ease,
			transform 0.12s ease,
			border-color 0.2s ease;
	}
	.nav-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		transform: translateX(2px);
	}
	.nav-btn.is-active {
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--brand) 85%, white 15%),
			var(--brand-600)
		);
		color: #0b1020;
		border-color: color-mix(in oklab, var(--brand) 80%, black 20%);
	}

	.panel-main {
		margin-left: 10px;
		padding: 20px clamp(18px, 3vw, 28px);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--glass-strong);
		box-shadow: var(--shadow);
		display: grid;
		gap: 12px;
		align-content: start;
	}
	.panel-main h2 {
		color: var(--muted);
		margin: 4px 0 2px;
		font-size: clamp(18px, 1.1vw + 12px, 24px);
	}

	.cta {
		padding: 14px 30px;
		font-weight: 700;
		border-radius: 14px;
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--brand) 92%, white 8%),
			var(--brand-600)
		);
		color: #0b1020;
		border: 1px solid color-mix(in oklab, var(--brand) 80%, black 20%);
		box-shadow:
			0 10px 22px rgba(234, 179, 8, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.35);
		transition:
			transform 0.12s ease,
			filter 0.2s ease;
	}
	.cta:hover {
		transform: translateY(-1px);
		filter: brightness(1.03);
	}
</style>
