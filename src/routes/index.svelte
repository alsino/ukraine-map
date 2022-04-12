<script>
	import { onMount } from 'svelte';
	import { MAP_TYPE } from '$lib/stores/shared';
	import { APP_HEIGHT } from '$lib/stores/shared';
	import { selectedLanguage } from '$lib/stores/shared';
	import { languagesAll } from '$lib/stores/languages';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';
	import Select from 'svelte-select';

	let heading;
	let subheading;
	let legendLabel1;
	let legendLabel2;
	let textUpdate;
	let textSourceDescription;
	let textSource;
	let textDataAccess;

	let lastUpdate;
	let totalRefugees;

	// Send map height to parent window
	$: {
		if ($APP_HEIGHT) {
			window.parent.postMessage({ height: $APP_HEIGHT }, '*');
		}
	}

	$: dropdownLanguages = languagesAll[$selectedLanguage.value];
	$: console.log(dropdownLanguages);

	onMount(async () => {
		// await getAllLanguages();
		await getLanguage($selectedLanguage.value);
		await getAggregateAPI();
	});

	// async function getAllLanguages() {
	// 	const res = await fetch(`/languages/languages.json`)
	// 		.then((response) => response.json())
	// 		.then(function (data) {
	// 			languages = data.languages;
	// 		});
	// }

	async function getLanguage(lang) {
		const res = await fetch(`/languages/${lang}.json`)
			.then((response) => response.json())
			.then(function (data) {
				heading = data.heading;
				subheading = data.subheading;
				legendLabel1 = data.legend1;
				legendLabel2 = data.legend2;
				textUpdate = data.textUpdate;
				textSourceDescription = data.textSourceDescription;
				textSource = data.textSource;
				textDataAccess = data.textDataAccess;
			});
	}

	$: legend = [
		{ label: legendLabel1, color: '#cad1d9' },
		{ label: legendLabel2, color: '#f4f4f4' }
	];

	function handleSelect(event) {
		$selectedLanguage = { value: event.detail.value, label: event.detail.label };
		// $selectedLanguage = event.detail.value;
		getLanguage($selectedLanguage.value);
	}

	async function getAggregateAPI() {
		let aggregateData =
			'https://data2.unhcr.org/population/?widget_id=294522&sv_id=54&population_group=5460';

		// Load aggregate data
		const resAggregate = await fetch(aggregateData)
			.then((response) => response.json())
			.then((dataRaw) => {
				let data = dataRaw.data;
				// console.log(data);

				// Force strings to numbers
				data.forEach(function (d) {
					d['individuals'] = +d['individuals'];
				});

				data = data[0];

				lastUpdate = data.date;
				totalRefugees = data.individuals;
			})
			.catch((error) => console.error('error', error));
	}
</script>

<div id="euranet-map" bind:clientHeight={$APP_HEIGHT}>
	<header>
		<div class="logo">
			<img src="./img/logo.png" alt="" />
		</div>
		<div class="select">
			<Select items={dropdownLanguages} value={$selectedLanguage} on:select={handleSelect} />
		</div>
	</header>
	<div id="chart" class="mt-8">
		{#if heading && subheading}
			<div id="chart-header">
				<h1 class="text-xl font-bold">{heading}</h1>
				<h3 class="text-md">{subheading}</h3>
			</div>
		{/if}

		<div id="chart-body" class="mt-4">
			{#if $MAP_TYPE == 'choropleth-api'}
				<MapChoroplethAPI {legend} />
			{:else if $MAP_TYPE == 'choropleth'}
				<MapChoropleth />
			{/if}
		</div>
	</div>
	{#if textUpdate && textSourceDescription && textSource && textDataAccess && lastUpdate}
		<div class="text-sm"><span class="font-bold">{textUpdate}:</span> {lastUpdate}, 12:00 CET</div>
		<div class="text-sm"><span class="font-bold">{textSourceDescription}:</span> {textSource}</div>
		<div class="text-sm underline">
			<a target="_blank" href="https://data2.unhcr.org/en/situations/ukraine">{textDataAccess}</a>
		</div>
	{/if}
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
