<script>
	import { MAP_TYPE } from '$lib/stores/shared';
	import { APP_HEIGHT } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';

	// Send map height to parent window
	$: {
		if ($APP_HEIGHT) {
			window.parent.postMessage({ height: $APP_HEIGHT }, '*');
			// window.parent.postMessage({ height: $APP_HEIGHT }, 'http://localhost:3000/');
			// window.parent.postMessage({ height: $APP_HEIGHT }, 'https://europe-map.vercel.app/');
		}
	}
</script>

<div id="euranet-map" bind:clientHeight={$APP_HEIGHT}>
	<h1>This is a title</h1>
	<h3>
		This is a subtitle Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam repellendus
		rem provident qui laborum
	</h3>
	{#if $MAP_TYPE == 'choropleth-api'}
		<MapChoroplethAPI />
	{:else if $MAP_TYPE == 'choropleth'}
		<MapChoropleth />
	{/if}
	<div>Last updated: 01/04/2022, 12:00 CET.</div>
	<div>Source: United Nations High Commissioner for Refugees</div>
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
