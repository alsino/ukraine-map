<script>
	import { MOUSE } from '$lib/stores/shared';
	import { onMount } from 'svelte';
	import { csvData } from '$lib/stores/shared';
	import { feature } from 'topojson-client';
	import { geoPath, geoIdentity } from 'd3-geo';
	import { dataReady } from '$lib/stores/shared';
	import { scaleQuantile, scaleQuantize, scaleSequential, scaleSequentialQuantile } from 'd3-scale';
	import { schemeBlues, schemeReds, interpolateBlues, interpolateReds } from 'd3-scale-chromatic';

	import scaleCluster from 'd3-scale-cluster';

	import { csv } from 'd3-fetch';
	import { extent } from 'd3-array';

	import { MAP_WIDTH } from '$lib/stores/shared';
	import { MAP_HEIGHT } from '$lib/stores/shared';

	import { formatThousands } from '$lib/utils/formatNumbers';

	// Make square dimensions i.e. 600x600 to fill all space
	let width = 600;
	let height = 600;
	let paddingMap = 150;

	// let dataReady = false;
	let tooltipAvailable = true; // Set this to switch on/ff global tooltip
	let tooltipVisible = false;
	let tooltipHeight;
	let tooltipWidth;

	let countries;
	let graticules;
	let bgCountries;
	let ukraine;
	let euCountries;
	let countryBoundaries;
	let schengenCountries;

	let hoveredCountry;

	const projection = geoIdentity().reflectY(true);
	const path = geoPath().projection(projection);
	const colorScale = scaleCluster();

	// Yellow
	const accentStroke = 'rgba(246, 207, 1, 1)';
	const accentFill = 'rgba(246, 207, 1, 0.4)';

	// Green
	// const accentStroke = 'rgba(81, 166, 101, 1)';
	// const accentFill = 'rgba(81, 166, 101, 0.4)';

	$: if ($dataReady) {
		console.log('Country data for map loaded');
		projection.fitExtent(
			[
				[paddingMap, paddingMap],
				[width - paddingMap, height - paddingMap]
			],
			ukraine
		);
	}

	async function fetchGeoData() {
		const res = await fetch(`/data/geodata/europe-20m.json`)
			.then((response) => response.json())
			.then(function (data) {
				bgCountries = feature(data, data.objects.cntrg);
				countries = feature(data, data.objects.nutsrg);
				graticules = feature(data, data.objects.gra);
				countryBoundaries = feature(data, data.objects.cntbn);

				let neighbourBorders = [
					{ name: 'russia', id: 1958, offset: '5px -5px' },
					{ name: 'belarus', id: 1954, offset: '-5px -5px' },
					{ name: 'poland', id: 1934, offset: '-5px 0px' },
					{ name: 'slovakia', id: 1806, offset: '-5px 0px' },
					{ name: 'hungary', id: 1785, offset: '-5px 0px' },
					{ name: 'romania', id: 1783, offset: '0px 5px' },
					{ name: 'moldova', id: 1786, offset: '-5px 5px' },
					{ name: 'romania', id: 1994, offset: '0px 5px' }
				];

				// Extract country borders
				let nBounds = neighbourBorders.map((n) => {
					let border = countryBoundaries.features.filter((i) => {
						return i.properties.id === n.id;
					})[0];
					border.properties.name = n.name;
					border.properties.offset = n.offset;
					return border;
				});

				countryBoundaries = {
					type: 'FeatureCollection',
					features: nBounds
				};

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

				// Extract Schengen countries
				let schengenFiltered = bgCountries.features
					.filter((item) => {
						return item.properties.isSchengen;
					})
					.sort((a, b) => {
						return a.properties.na.localeCompare(b.properties.na);
					});

				schengenCountries = {
					type: 'FeatureCollection',
					features: schengenFiltered
				};

				console.log('schengenCountries', schengenCountries);

				let test = bgCountries.features.filter((c) => {
					return c.properties.na == 'Ukraine';
				});

				ukraine = {
					type: 'FeatureCollection',
					features: test
				};

				console.log('ukraine', ukraine);
			});
	}

	async function fetchAPI() {
		let url =
			'https://data2.unhcr.org/population/get/sublocation?widget_id=284342&sv_id=54&population_group=5459,5460&forcesublocation=0&fromDate=1900-01-01';
		const res = await fetch(url)
			.then((response) => response.json())
			.then((dataRaw) => {
				let data = dataRaw.data;
				// Force strings to numbers
				data.forEach(function (d) {
					d['individuals'] = +d['individuals'];
				});

				let extentArray = data.map((item) => {
					return item.individuals;
				});

				csvData.set(data);
				// // Set color scale domain and range
				colorScale.domain(extentArray).range(schemeBlues[5]);
			})
			.catch((error) => console.error('error', error));
	}

	function mergeData() {
		// Transform csv structure to object style to be better usable
		let csvTransformed = $csvData.reduce(
			(obj, item) => Object.assign(obj, { [item.geomaster_name]: item.individuals }),
			{}
		);

		delete csvTransformed['Other European countries'];

		// // Add values from csv
		bgCountries.features.map((item) => {
			item.value = csvTransformed[item.properties.na];
		});

		// console.log(csvTransformed);
		// console.log(bgCountries);

		$dataReady = true;
	}

	onMount(async () => {
		await fetchGeoData();
		await fetchAPI();
		await mergeData();
	});

	function getFill(feature) {
		if (feature.value) {
			return colorScale(feature.value);
		} else {
			return '#F4F4F4';
		}
	}

	function getFillSchengen(feature) {
		if (feature.value) {
			return colorScale(feature.value);
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
	<div
		id="map"
		on:mousemove={handleMouseMove}
		bind:clientWidth={$MAP_WIDTH}
		bind:clientHeight={$MAP_HEIGHT}
	>
		<svg preserveAspectRatio="xMinYMid meet" viewbox="0 0 {width} {height}">
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
					on:mouseenter={() => handleMouseEnter(feature)}
					on:mouseleave={() => handleMouseLeave(feature)}
				/>
			{/each}

			<!-- None EU countries -->
			<!-- {#each bgCountries.features as feature, index}
        <path
          d={path(feature)}
          stroke="#CDCDCD"
          fill={'#E0E4E9'}
          class={getClass(feature)}
          on:mouseenter={() => handleMouseEnter(feature)}
          on:mouseleave={() => handleMouseLeave(feature)}
        />
      {/each} -->

			<!-- EU countries -->
			<!-- {#each euCountries.features as feature, index}
        <path
          d={path(feature)}
          stroke="#A3A3A3"
          fill={'#C5CBD0'}
          class={getClass(feature)}
          on:mouseenter={() => handleMouseEnter(feature)}
          on:mouseleave={() => handleMouseLeave(feature)}
        />
      {/each} -->

			<!-- Schengen countries -->
			{#each schengenCountries.features as feature, index}
				<path
					d={path(feature)}
					stroke="white"
					fill={getFillSchengen(feature)}
					class={getClass(feature)}
					on:mouseenter={() => handleMouseEnter(feature)}
					on:mouseleave={() => handleMouseLeave(feature)}
				/>
			{/each}

			<!-- countries -->
			<!-- {#each countries.features as feature, index}
        <path
          d={path(feature)}
          stroke="#CDCDCD"
          fill={'red'}
          class={getClass(feature)}
        />
      {/each} -->

			<!-- ukraine -->
			{#each ukraine.features as feature, index}
				<path d={path(feature)} fill={accentFill} stroke={accentStroke} class={'ukraine'} />
			{/each}

			<!-- boundaries -->
			{#each countryBoundaries.features as feature, index}
				<path
					d={path(feature)}
					class={'boundary boundary-' + feature.properties.name}
					style={`filter: drop-shadow(${feature.properties.offset} 3px ${accentStroke});
           -webkit-filter: drop-shadow(${feature.properties.offset} 3px ${accentStroke});`}
				/>
			{/each}
		</svg>

		<div
			class="tooltip {tooltipVisible ? 'active' : ''}"
			style="top: {$MOUSE.y - tooltipHeight}px; left:{$MOUSE.x - tooltipWidth}px;"
			bind:clientHeight={tooltipHeight}
			bind:clientWidth={tooltipWidth}
		>
			<div class="tooltip-head">{$MOUSE.tooltip.name}</div>
			<div class="tooltip-body">
				{formatThousands($MOUSE.tooltip.value)} refugees
			</div>
		</div>
		<!-- </svg> -->
	</div>
{/if}

<style>
	#map {
		/* background-color: green; */
	}

	svg {
		/* background: blue; */
		width: 100%;
		height: auto;
	}

	svg path {
		stroke-width: 0.5px;
		cursor: pointer;
		transition: all 0.5s;
	}

	.noPointer {
		pointer-events: none;
	}

	.pointer {
		pointer-events: all;
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

	.ukraine {
		stroke-width: 1;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.boundary {
		stroke-width: 10;
		stroke: rgba(246, 207, 1, 0.2); /* yellow */
		/* stroke: rgba(81, 166, 101, 0.2); green */
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;

		/* animation-name: borderPulse;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-direction: alternate-reverse; */
	}

	@keyframes borderPulse {
		0% {
			opacity: 0;
		}
		10% {
			opacity: 0.1;
		}
		20% {
			opacity: 0.2;
		}
		30% {
			opacity: 0.3;
		}
		40% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.5;
		}
		60% {
			opacity: 0.6;
		}
		70% {
			opacity: 0.7;
		}
		80% {
			opacity: 0.8;
		}
		90% {
			opacity: 0.9;
		}
		100% {
			opacity: 1;
		}
	}
</style>
