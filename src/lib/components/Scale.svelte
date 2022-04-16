<script>
	import { formatThousands } from '$lib/utils/formatNumbers';

	export let classes;
	export let clusters;

	clusters.unshift(0);
	console.log(clusters);
</script>

<div class="text-sm absolute left-3 top-3 rounded bg-white p-3">
	<div class="flex">
		{#each classes as swatch}
			<div class="swatch" style="background: {swatch};" />
		{/each}
	</div>
	<div class="flex">
		{#each clusters as number}
			<div class="swatch text-xs">{formatThousands(number)}</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.swatch {
		width: 10vw;
		height: 1.5vh;
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
