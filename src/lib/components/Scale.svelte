<script>
	import { each } from 'svelte/internal';

	export let classes;
</script>

<div class="text-sm absolute left-6 top-6 rounded bg-white p-3">
	<div class="flex">
		{#each classes as swatch}
			<div class="swatch" style="background: {swatch};" />
		{/each}
	</div>
	<div class="flex">
		{#each classes as swatch}
			<div class="swatch">1</div>
			<!-- <div class="swatch" style="background: {swatch};" /> -->
		{/each}
	</div>
</div>

<style lang="scss">
	.swatch {
		width: 2rem;
		height: 1vh;
	}

	.swatch:first-of-type {
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;
	}

	.swatch:last-of-type {
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
	}
</style>
