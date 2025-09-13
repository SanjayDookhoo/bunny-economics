<script>
	import { onMount } from 'svelte';
	import infoSVG from '../assets/info.svg';
	import githubSVG from '../assets/github.svg';
	import { page } from '$app/stores';
	import '../app.css';

	let { children } = $props();

	// a simple check to ensure the earliest onMount lifecyle occurs, after this happens, the window object is available at the top level in any file, ie. window.localStorage
	let isReady = $state(false);
	onMount(() => {
		isReady = true;
	});
</script>

{#if isReady}
	<div class="w-screen h-screen p-8 pt-0 bg-gray-900 flex flex-col text-white">
		<div class="flex justify-between h-16 text-white">
			<div class="flex items-center">
				<a class="flex items-center" href="/">
					<img src="./logo.png" class="w-12 h-12" alt="logo" />
					<div class="pl-4" style="font-size: 30px;">Prosperity Bunny</div>
				</a>
			</div>
			<div class="flex [&>*]:px-4">
				<a
					href="/about"
					class="flex items-center border-b-1"
					style="border-color: {$page.url.pathname == '/about'
						? '#dda527'
						: 'transparent'}"
				>
					<img
						class="bg-white rounded-full p-[1px] h-[32px] w-[32px]"
						src={infoSVG}
						alt="About"
					/>
					<div class="pl-2">About</div>
				</a>
				<a
					href="https://github.com/SanjayDookhoo/hareconomics2"
					class="flex items-center"
				>
					<img
						class="bg-white rounded-full p-[1px] h-[32px] w-[32px]"
						src={githubSVG}
						alt="Github"
					/>
					<div class="pl-2">github</div>
				</a>
			</div>
		</div>
		{@render children?.()}
	</div>
	<div
		class="flex justify-center w-screen fixed bottom-0 bg-gray-800 text-white"
	>
		<div>
			Built with care for <strong>Hack the System</strong>. May your bells be
			bouncy and your carrots abundant. 🥕
		</div>
	</div>
{/if}
