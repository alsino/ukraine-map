<script>
	import { MAP_TYPE } from '$lib/stores/shared';
	import { APP_HEIGHT } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';
	import Select from 'svelte-select';

	// Send map height to parent window
	$: {
		if ($APP_HEIGHT) {
			window.parent.postMessage({ height: $APP_HEIGHT }, '*');
		}
	}
	// $: console.log($APP_HEIGHT);

	let items = [
		{ value: 'chocolate', label: 'Chocolate' },
		{ value: 'pizza', label: 'Pizza' },
		{ value: 'cake', label: 'Cake' },
		{ value: 'chips', label: 'Chips' },
		{ value: 'ice-cream', label: 'Ice Cream' }
	];

	let value = { value: 'cake', label: 'Cake' };

	function handleSelect(event) {
		console.log('selected item', event.detail);
		// .. do something here 🙂
	}
</script>

<div id="euranet-map" bind:clientHeight={$APP_HEIGHT}>
	<header>
		<div class="logo">
			<img src="./img/logo.png" alt="" />
		</div>
		<div class="select">
			<Select {items} {value} on:select={handleSelect} />
		</div>
	</header>
	<div id="chart" class="mt-8">
		<div id="chart-header">
			<h1 class="text-2xl font-bold">More than 4.2m refugees have fled from Ukraine</h1>
			<h3 class="text-xl">
				This map is updated daily with the latest data from UNHCR on refugees fleeing Ukraine into
				neighbouring countries since 24 February 2022
			</h3>
		</div>

		<div id="chart-body" class="mt-4">
			{#if $MAP_TYPE == 'choropleth-api'}
				<MapChoroplethAPI />
			{:else if $MAP_TYPE == 'choropleth'}
				<MapChoropleth />
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		text-align: center;
		font-family: Arial, Helvetica, sans-serif;
		color: #2b3163;
	}

	header {
		display: flex;
		align-items: center;
	}

	.logo {
		flex: 1;
	}

	.select {
		flex: 1;
	}

	div {
		text-align: left;
	}
</style>
