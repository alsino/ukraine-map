<script>
	import { onMount } from 'svelte';
	import { MAP_TYPE } from '$lib/stores/shared';
	import { APP_HEIGHT } from '$lib/stores/shared';
	import MapChoroplethAPI from '$lib/components/MapChoroplethAPI.svelte';
	import MapChoropleth from '$lib/components/MapChoropleth.svelte';
	import Select from 'svelte-select';

	let heading;
	let subheading;
	let languages;
	let langDefault = { value: 'en', label: 'English' };
	let legendLabel1;
	let legendLabel2;
	let textUpdate;
	let textSource;
	let textDataAccess;

	// Send map height to parent window
	$: {
		if ($APP_HEIGHT) {
			window.parent.postMessage({ height: $APP_HEIGHT }, '*');
		}
	}

	onMount(async () => {
		await getAllLanguages();
		await getLanguage(langDefault.value);
	});

	async function getAllLanguages() {
		const res = await fetch(`/languages/languages.json`)
			.then((response) => response.json())
			.then(function (data) {
				languages = data.languages;
				// console.log(languages);
			});
	}

	async function getLanguage(lang) {
		const res = await fetch(`/languages/${lang}.json`)
			.then((response) => response.json())
			.then(function (data) {
				heading = data.heading;
				subheading = data.subheading;
				legendLabel1 = data.legend1;
				legendLabel2 = data.legend2;
				textUpdate = data.textUpdate;
				textSource = data.textSource;
				textDataAccess = data.textDataAccess;
			});
	}

	$: legend = [
		{ label: legendLabel1, color: '#cad1d9' },
		{ label: legendLabel2, color: '#f4f4f4' }
	];

	function handleSelect(event) {
		let selectedLang = event.detail.value;
		getLanguage(selectedLang);
	}
</script>

<div id="euranet-map" bind:clientHeight={$APP_HEIGHT}>
	<header>
		<div class="logo">
			<img src="./img/logo.png" alt="" />
		</div>
		<div class="select">
			<Select items={languages} value={langDefault} on:select={handleSelect} />
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
	{#if textUpdate && textSource && textDataAccess}
		<div class="text-sm">{textUpdate}: 01/04/2022, 12:00 CET.</div>
		<div class="text-sm">{textSource}.</div>
		<div class="text-sm">{textDataAccess}</div>
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
