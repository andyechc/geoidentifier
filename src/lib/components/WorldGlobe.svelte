<script>
	import { onMount } from "svelte";
	import { geoPath, geoOrthographic, geoGraticule10 } from "d3-geo";
	import { globeSlugFor, dataRev } from "$lib/data/live.js";
	import { getCountries110 } from "$lib/map.js";

	// onSelect(slug) for MVP countries · onMissing(name) otherwise
	let { onSelect = null, onMissing = null } = $props();

	let countries = $state([]);
	let rotation = $state([-10, -10, 0]);
	let scale = $state(570);
	let dragging = $state(false);

	const width = 1200;
	const height = 1200;
	const projection = geoOrthographic()
		.scale(scale)
		.translate([width / 2, height / 2])
		.rotate([-10, -10, 0])
		.clipAngle(90);

	const graticule = geoGraticule10();
	const path = geoPath().projection(projection);

	let rendered = $derived.by(() => {
		$dataRev;
		projection.rotate(rotation).scale(scale);
		return countries.map((c) => ({
			name: c.properties.name,
			slug: globeSlugFor(c.properties.name),
			d: path(c)
		}));
	});
	let gratPath = $derived.by(() => {
		projection.rotate(rotation).scale(scale);
		return path(graticule);
	});
	// Sphere drawn by the projection itself so it grows with zoom (no square edges).
	let spherePath = $derived.by(() => {
		projection.rotate(rotation).scale(scale);
		return path({ type: "Sphere" });
	});

	let lastPos = null;
	let movedPx = 0;

	function onPointerDown(e) {
		dragging = true;
		movedPx = 0;
		lastPos = [e.clientX, e.clientY];
	}

	function onPointerMove(e) {
		if (!dragging || !lastPos) return;
		const dx = e.clientX - lastPos[0];
		const dy = e.clientY - lastPos[1];
		movedPx += Math.abs(dx) + Math.abs(dy);
		lastPos = [e.clientX, e.clientY];
		rotation = [
			rotation[0] + dx * 0.25,
			Math.max(-60, Math.min(60, rotation[1] - dy * 0.25)),
			0
		];
	}

	function onPointerUp() {
		dragging = false;
		lastPos = null;
	}

	function fire(name, slug) {
		if (movedPx >= 6) return;
		if (slug && onSelect) onSelect(slug);
		else if (!slug && onMissing) onMissing(name);
	}

	// Sphere is drawn by the projection (radius === scale), so cap the zoom at the
	// radius that keeps it inscribed in the viewBox — otherwise the globe fills the
	// whole square frame and reads as a square instead of a sphere.
	const MIN_SCALE = 320;
	const MAX_SCALE = 590;

	function zoom(delta) {
		scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
	}

	function onWheel(e) {
		e.preventDefault();
		zoom(-e.deltaY * 0.25);
	}

	onMount(async () => {
		countries = await getCountries110();
	});
</script>

<div class="globe-fit mx-auto w-full max-w-[640px] relative" class:dragging>
	<div class="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
		<button
			class="btn btn-sm btn-circle btn-ghost bg-base-200/90 backdrop-blur"
			onclick={() => zoom(100)}
			aria-label="Zoom in"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M8 11h6"/><path d="M11 8v6"/></svg>
		</button>
		<button
			class="btn btn-sm btn-circle btn-ghost bg-base-200/90 backdrop-blur"
			onclick={() => zoom(-100)}
			aria-label="Zoom out"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M8 11h6"/></svg>
		</button>
	</div>
	<svg
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		class="globe-svg"
		role="application"
		aria-label="Interactive world globe"
		onpointerdown={onPointerDown}
		onwheel={onWheel}
	>
		<defs>
			<radialGradient id="gg-sphere" cx="35%" cy="30%" r="75%">
				<stop offset="0%" stop-color="var(--color-base-300)" />
				<stop offset="100%" stop-color="var(--color-base-100)" />
			</radialGradient>
			<clipPath id="gg-clip">
				<path d={spherePath} />
			</clipPath>
		</defs>

		<path d={spherePath} fill="url(#gg-sphere)" />

		<g clip-path="url(#gg-clip)">
			<path d={gratPath} fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-width="1" />
			{#each rendered as c (`${c.name}`)}
				{#if c.d}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<path
						d={c.d}
						fill={c.slug ? "var(--color-primary)" : "currentColor"}
						fill-opacity={c.slug ? 0.92 : 0.14}
						stroke="var(--color-base-100)"
						stroke-width="1"
						class="shape {c.slug ? 'avail' : ''}"
						onclick={() => fire(c.name, c.slug)}
					/>
				{/if}
			{/each}
		</g>

		<!-- rim -->
		<path d={spherePath} fill="none" stroke="currentColor" stroke-opacity="0.12" stroke-width="1.5" />
	</svg>
</div>
<svelte:window onpointermove={onPointerMove} onpointerup={onPointerUp} onpointercancel={onPointerUp} />

<style>
	.globe-fit {
		aspect-ratio: 1 / 1;
		touch-action: none;
		cursor: grab;
	}
	.globe-fit.dragging {
		cursor: grabbing;
	}
	.globe-svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.shape {
		transition: fill-opacity 0.15s;
	}
	.shape.avail {
		cursor: pointer;
	}
	.shape.avail:hover {
		fill-opacity: 1;
		fill: var(--color-primary);
	}
</style>
