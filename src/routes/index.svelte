<script>
	import { MAP_TYPE } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';

	// DataWrapper resize function
	// function resizeDW(e) {
	//   'use strict';
	//   if (void 0 !== e.data['datawrapper-height']) {
	//     var t = document.querySelectorAll('iframe');
	//     for (var a in e.data['datawrapper-height'])
	//       for (var r = 0; r < t.length; r++) {
	//         if (t[r].contentWindow === e.source)
	//           t[r].style.height = e.data['datawrapper-height'][a] + 'px';
	//       }
	//   }
	// }
</script>

<!-- <svelte:window on:message={resizeDW} /> -->

{#if $MAP_TYPE == 'choropleth-api'}
	<MapChoroplethAPI />
{:else if $MAP_TYPE == 'choropleth'}
	<MapChoropleth />
{/if}

<style>
	:global(body) {
		margin: 0;
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>
