<script>
	import GameWindow from '../components/GameWindow.svelte';
	import infoSVG from '../assets/info.svg';
	import githubSVG from '../assets/github.svg';
</script>

<div class="w-screen h-screen p-8 pt-0 bg-gray-900 flex flex-col">
	<div class="flex justify-end h-16 text-white [&>*]:px-4">
		<a href="/about" class="flex items-center">
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
	<GameWindow />
</div>
