<script>
	import { MAP_TYPE } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';
</script>

<div id="euranet-map">
	<h1>This is a title</h1>
	{#if $MAP_TYPE == 'choropleth-api'}
		<MapChoroplethAPI />
	{:else if $MAP_TYPE == 'choropleth'}
		<MapChoropleth />
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}

	h1 {
		text-align: left;
	}
</style>
