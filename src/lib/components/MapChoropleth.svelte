<script>
	import { MOUSE } from '$lib/stores/shared';
	import { onMount } from 'svelte';
	import { csvData } from '$lib/stores/shared';
	import { feature } from 'topojson-client';
	import { geoPath, geoIdentity } from 'd3-geo';
	import { dataReady } from '$lib/stores/shared';
	import { scaleQuantile, scaleSequential, scaleSequentialQuantile } from 'd3-scale';
	import { schemeBlues, schemeReds, interpolateBlues, interpolateReds } from 'd3-scale-chromatic';

	import { csv } from 'd3-fetch';
	import { extent } from 'd3-array';

	import { formatPercent } from '$lib/utils/formatNumbers';

	// Make square dimensions i.e. 600x600 to fill all space
	let width = 600;
	let height = 600;
	let paddingMap = -60;

	// let dataReady = false;
	let tooltipAvailable = true; // Set this to switch on/ff global tooltip
	let tooltipVisible = false;
	let tooltipHeight;

	let countries;
	let graticules;
	let bgCountries;
	let euCountries;

	let hoveredCountry;

	const projection = geoIdentity().reflectY(true);
	const path = geoPath().projection(projection);
	const colorScale = scaleQuantile();

	$: if ($dataReady) {
		console.log('Country data for map loaded');
		projection.fitExtent(
			[
				[paddingMap, paddingMap],
				[width - paddingMap, height - paddingMap]
			],
			graticules
		);
	}

	async function fetchGeoData() {
		const res = await fetch(`/data/geodata/europe-20m.json`)
			.then((response) => response.json())
			.then(function (data) {
				bgCountries = feature(data, data.objects.cntrg);
				countries = feature(data, data.objects.nutsrg);
				graticules = feature(data, data.objects.gra);

				// Extract EU countries
				let euFiltered = bgCountries.features
					.filter((item) => {
						return item.properties.isEuMember;
					})
					.sort((a, b) => {
						return a.properties.na.localeCompare(b.properties.na);
					});

				euCountries = {
					type: 'FeatureCollection',
					features: euFiltered
				};

				console.log(euCountries);
			})
			.catch((error) => console.error('error', error));
	}

	async function fetchCSV() {
		const res = await csv('/data/thematic/data-1.csv')
			.then(function (data) {
				// Parse numbers as integers
				data.forEach(function (d) {
					d['value'] = +d['value'];
				});

				let extentArray = data.map((item) => {
					return item.value;
				});
				csvData.set(data);

				// Set color scale domain and range
				colorScale.domain(extent(extentArray)).range(schemeBlues[5]);
				// console.log('csv data', data);
			})
			.catch((error) => console.error('error', error));
	}

	function mergeData() {
		// Transform csv structure to object style to be better usable
		let csvTransformed = $csvData.reduce(
			(obj, item) => Object.assign(obj, { [item.id]: item.value }),
			{}
		);
		// Add values from csv
		countries.features.map((item) => {
			item.value = csvTransformed[item.properties.id];
		});

		euCountries.features.map((item) => {
			item.value = csvTransformed[item.properties.id];
		});

		$dataReady = true;
	}

	onMount(async () => {
		await fetchGeoData();
		await fetchCSV();
		await mergeData();
	});

	// function getFill(feature) {
	// 	return colorScale(feature.value);
	// }

	function getFill(feature) {
		if (feature.value) {
			return colorScale(feature.value);
		} else {
			return '#F4F4F4';
		}
	}

	function getFillEu(feature) {
		if (feature.value) {
			return colorScale(feature.value);
		} else {
			return '#CAD1D9';
		}
	}

	function getFillTest(feature) {
		if (feature.properties.isEuranetMember) {
			return '#51A665';
		} else {
			return '#CAD1D9';
		}
	}

	function getClass(feature) {
		if (feature.value) {
			return 'pointer';
		} else {
			return 'noPointer';
		}
	}

	function handleMouseMove(e) {
		var divOffset = offset(e.currentTarget);
		let mouseX = e.pageX - divOffset.left;
		let mouseY = e.pageY - divOffset.top;
		// console.log(mouseX, mouseY);

		if (hoveredCountry) {
			MOUSE.set({
				x: mouseX,
				y: mouseY,
				tooltip: {
					name: hoveredCountry.name,
					value: hoveredCountry.value
				}
			});
		}

		// console.log($MOUSE);

		// Calculate the position of the map div in the page to get mouse position
		function offset(el) {
			var rect = el.getBoundingClientRect(),
				scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
				scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
		}
	}

	$: handleMouseEnter = function (country) {
		if (tooltipAvailable) {
			hoveredCountry = {
				name: country.properties.na,
				value: country.value
			};

			if (country.properties.na || country.value) {
				tooltipVisible = true;
			}
		}
	};

	$: handleMouseLeave = function (country) {
		if (tooltipAvailable) {
			tooltipVisible = false;
		}
	};
</script>

{#if $dataReady}
	<div id="map" on:mousemove={handleMouseMove}>
		<svg preserveAspectRatio="xMidYMid meet" viewbox="0 0 {width} {height}">
			<!-- graticules (lines) -->
			{#each graticules.features as feature, index}
				<path d={path(feature)} stroke="#cfcfcf" fill="transparent" class="noPointer" />
			{/each}

			<!-- bgCountries -->
			{#each bgCountries.features as feature, index}
				<path
					d={path(feature)}
					stroke="#CDCDCD"
					fill={getFill(feature)}
					class={getClass(feature)}
				/>
			{/each}

			<!-- EU countries -->
			{#each euCountries.features as feature, index}
				<path
					d={path(feature)}
					stroke="#A3A3A3"
					fill={getFillEu(feature)}
					class={getClass(feature)}
					on:mouseenter={() => handleMouseEnter(feature)}
					on:mouseleave={() => handleMouseLeave(feature)}
				/>
			{/each}
		</svg>

		<div
			class="tooltip {tooltipVisible ? 'active' : ''}"
			style="top: {$MOUSE.y - tooltipHeight}px; left:{$MOUSE.x}px;"
			bind:clientHeight={tooltipHeight}
		>
			<div class="tooltip-head">{$MOUSE.tooltip.name}</div>
			<div class="tooltip-body">{formatPercent($MOUSE.tooltip.value)}</div>
		</div>
	</div>
{/if}

<style>
	#map {
		/* background-color: #f1f5f9; */
	}

	svg {
		/* background: blue; */
	}

	svg path {
		stroke-width: 0.5px;
		cursor: pointer;
		transition: all 0.5s;
	}

	.noPointer {
		pointer-events: none;
	}

	.tooltip {
		text-align: left;
		position: absolute;
		pointer-events: none;
		display: none;
		background: white;
		padding: 1rem;
		border-radius: 3px;
		z-index: 0;
		box-shadow: 0 10px 20px 0 rgba(185, 185, 185, 0.25);
	}

	.tooltip-head {
		font-weight: 600;
		padding-bottom: 0.5rem;
	}

	.active {
		display: block;
	}
</style>
