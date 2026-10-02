<script>
		import { geoPath, geoMercator, geoGraticule10 } from "d3-geo";
	import { getCountries50, SLUG_TO_TOPO } from "$lib/map.js";
	import { SILHOUETTE_EXCLUDE } from "$lib/continents.js";
	import { silhouetteNames } from "$lib/data/live.js";

	// Card mode (solid primary silhouette) or locate mode (neutral continent
	// with the country highlighted in primary) when `highlight` is set.
	let { continent = "africa", highlight = null } = $props();

	const W = 520;
	const H = 400;

	let shapes = $state([]);
	let target = $state("");
	let grat = $state("");

	const locate = $derived(highlight !== null);

	async function load() {
		shapes = [];
		grat = "";
		target = "";
		const features = await getCountries50();
		const excluded = new Set(SILHOUETTE_EXCLUDE[continent] ?? []);
		const wanted = new Set(silhouetteNames(continent));
		const members = features.filter(
			(f) => wanted.has(f.properties.name) && !excluded.has(f.properties.name)
		);
		if (!members.length) return;

		const proj = geoMercator().fitExtent(
			[
				[14, 14],
				[W - 14, H - 14]
			],
			{ type: "FeatureCollection", features: members }
		);
		const path = geoPath().projection(proj);
		shapes = members.map((f) => path(f)).filter(Boolean);
		if (!locate) grat = path(geoGraticule10());

		if (highlight) {
			const topoName = SLUG_TO_TOPO[highlight];
			const f = features.find((x) => x.properties.name === topoName);
			if (f) target = path(f);
		}
	}


	$effect(() => {
		continent;
		highlight;
		load();
	});
</script>

<svg viewBox="0 0 {W} {H}" class="h-auto w-full" role="img" aria-label="{continent} shape">
	{#if grat}
		<path
			d={grat}
			fill="none"
			stroke="var(--color-base-content)"
			stroke-opacity="0.12"
			stroke-width="0.7"
		/>
	{/if}
	{#each shapes as d}
		{#if locate}
			<path
				{d}
				fill="var(--color-base-content)"
				fill-opacity="0.28"
				stroke="var(--color-base-100)"
				stroke-width="0.8"
			/>
		{:else}
			<path
				{d}
				fill="var(--color-primary)"
				fill-opacity="0.92"
				stroke="var(--color-base-100)"
				stroke-width="1"
			/>
		{/if}
	{/each}
	{#if target}
		<path
			d={target}
			fill="var(--color-primary)"
			stroke="var(--color-primary)"
			stroke-width="1"
			style="filter: drop-shadow(0 0 6px var(--color-primary));"
		/>
	{/if}
</svg>