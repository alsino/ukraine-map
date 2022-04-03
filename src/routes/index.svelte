<script>
	import { MAP_TYPE } from '$lib/stores/shared';
	import { APP_HEIGHT } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';

	// Send map height to parent window
	$: {
		if ($APP_HEIGHT) {
			window.parent.postMessage({ height: $APP_HEIGHT }, '*');
		}
	}

	$: console.log($APP_HEIGHT);
</script>

<div id="euranet-map" bind:clientHeight={$APP_HEIGHT}>
	<div id="header">
		<h1>This is a title</h1>
		<h3>
			This is a subtitle Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam repellendus
			rem provident qui laborum
		</h3>
	</div>

	<div id="chart">
		{#if $MAP_TYPE == 'choropleth-api'}
			<MapChoroplethAPI />
		{:else if $MAP_TYPE == 'choropleth'}
			<MapChoropleth />
		{/if}
	</div>

	<div id="footer">
		<div>Last updated: 01/04/2022, 12:00 CET.</div>
		<div>Source: United Nations High Commissioner for Refugees</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}

	div {
		text-align: left;
	}

	h1,
	h2,
	h3 {
		text-align: left;
	}
</style>
