<script>
		import { geoPath, geoMercator, geoGraticule10 } from "d3-geo";
	import { getCountries50, REUNION_LONLAT } from "$lib/map.js";
	import { topoNameFor, liveGetCountry } from "$lib/data/live.js";

	let { slug } = $props();

	const W = 480;
	const H = 360;
	let d = $state("");
	let isMarker = $state(false);
	let markerXY = $state([0, 0]);
	let grat = $state("");

	async function load() {
		d = "";
		grat = "";
		isMarker = false;
		const features = await getCountries50();
		const path = geoPath();
		if (slug === "reunion") {
			// No polygon in Natural Earth: island marker on a zoomed ocean view
			const proj = geoMercator().center(REUNION_LONLAT).scale(900).translate([W / 2, H / 2]);
			path.projection(proj);
			markerXY = proj(REUNION_LONLAT);
			grat = path(geoGraticule10());
			isMarker = true;
			return;
		}
		const topoName = topoNameFor(slug);
		const f = topoName ? features.find((x) => x.properties.name === topoName) : null;
		if (!f) {
			// Sin polígono en Natural Earth: marcador genérico centrado
			const proj = geoMercator().scale(1).translate([W / 2, H / 2]);
			path.projection(proj);
			markerXY = [W / 2, H / 2];
			grat = path(geoGraticule10());
			isMarker = true;
			return;
		}
		const proj = geoMercator().fitSize([W - 16, H - 16], f);
		// recenter: fitSize sets translate/scale, shift by margin
		proj.translate([proj.translate()[0] + 8, proj.translate()[1] + 8]);
		path.projection(proj);
		d = path(f);
	}


	// el detalle reutiliza la instancia al navegar entre países
	$effect(() => {
		slug;
		load();
	});
</script>

<svg viewBox="0 0 {W} {H}" class="h-auto w-full" role="img" aria-label="Country shape">
	{#if isMarker}
		<path d={grat} fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
		<circle cx={markerXY[0]} cy={markerXY[1]} r="10" fill="var(--color-primary)" />
		<circle cx={markerXY[0]} cy={markerXY[1]} r="16" fill="none" stroke="var(--color-primary)" stroke-width="1.5" opacity="0.5" />
	{:else if d}
		<path {d} fill="var(--color-primary)" fill-opacity="0.85" stroke="#0c0a09" stroke-width="1.5" />
	{/if}
</svg>
