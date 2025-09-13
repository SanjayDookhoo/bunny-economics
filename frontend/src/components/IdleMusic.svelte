<script>
	import { general } from '$lib/stores.svelte';
	import { onMount } from 'svelte';

	let userInteracted = false;

	let gainNode = $state(null);
	let source;

	// Chrome (and most modern browsers) block autoplay of audio/video with sound until the user has interacted with the page
	// loads into buffer and plays from buffer to reduce the delay of autoplay restarting the loop
	onMount(() => {
		const removeListeners = () => {
			document.removeEventListener('click', interactedWithPage);
			document.removeEventListener('keydown', interactedWithPage);
			document.removeEventListener('touchstart', interactedWithPage);
		};

		const interactedWithPage = () => {
			if (!userInteracted) {
				userInteracted = true;

				let audioContext;
				let buffer;

				const loadAudio = async () => {
					if (!audioContext) {
						audioContext = new (window.AudioContext ||
							window.webkitAudioContext)();
						gainNode = audioContext.createGain(); // create a gain node
						gainNode.connect(audioContext.destination); // connect it to speakers
					}
					// Fetch and decode
					const response = await fetch('/idle.mp3'); // adjust path if needed
					const arrayBuffer = await response.arrayBuffer();
					buffer = await audioContext.decodeAudioData(arrayBuffer);
				};

				const playLoop = async () => {
					if (!buffer) await loadAudio();

					// Create a new source each time you play
					source = audioContext.createBufferSource();
					source.buffer = buffer;
					source.loop = true;

					// Connect source → gain → destination
					source.connect(gainNode);
					gainNode.gain.value = general.volume;

					source.start(0);
				};

				playLoop();
				removeListeners();
			}
		};

		// Listen for the first valid interaction
		document.addEventListener('click', interactedWithPage);
		document.addEventListener('keydown', interactedWithPage);
		document.addEventListener('touchstart', interactedWithPage);

		return () => {
			removeListeners();
			if (source) source.stop();
		};
	});

	$effect(() => {
		if (gainNode) {
			gainNode.gain.value = general.volume;
		}
	});
</script>
